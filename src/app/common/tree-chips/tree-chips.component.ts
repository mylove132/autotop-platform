import { Directionality } from '@angular/cdk/bidi';
import { SelectionModel } from '@angular/cdk/collections';
import { COMMA, ENTER, ESCAPE, UP_ARROW } from '@angular/cdk/keycodes';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  PositionStrategy,
  ViewportRuler
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  Output,
  EventEmitter
} from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatFormField } from '@angular/material/form-field';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { fromEvent, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { CatalogService } from 'src/app/services/catalog.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { ItemFlatNode, ItemNode } from './tree-chips.model';

@Component({
  selector: 'app-tree-chips',
  templateUrl: './tree-chips.component.html',
  styleUrls: ['./tree-chips.component.scss']
})
export class TreeChipsComponent implements OnInit, OnDestroy {
  @Input() isDisabled = false; // 是否禁用表单控件
  @Input() displayError = false; // 是否显示错误匹配器
  @Input() treeChipsSelected: any[] = []; // 初始化已选择的chips
  @Output() treeChipsSelectChange = new EventEmitter<any>(); // 向外发射事件
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  // chips
  removable = true; // 是否可删除
  addOnBlur = true; // 输入事件失去焦点的时候chips发出end事件
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedCataLogList: any[] = []; // 已经选择的目录树叶子节点
  // 目录树
  flatNodeMap = new Map<ItemFlatNode, ItemNode>();    // 扁平节点到嵌套节点的映射
  nestedNodeMap = new Map<ItemNode, ItemFlatNode>();  // 嵌套节点到扁平节点的映射
  treeControl: FlatTreeControl<ItemFlatNode>;
  treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;
  dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;
  checklistSelection = new SelectionModel<ItemFlatNode>(true); // 选择清单（支持多选）
  // overlay
  @ViewChild('chipList') chipList: any;
  @ViewChild('treePanel') overlayTreePanel: TemplateRef<any>;
  @ViewChild('formFile') formField: MatFormField;
  @Input() position: 'auto' | 'above' | 'below' = 'auto';
  @Input() connectedTo: any;
  private overlayRef: OverlayRef | null;
  private portal: TemplatePortal;
  private readonly closeKeyEventStream = new Subject<void>(); // 可以关闭面板的键盘事件流。
  private positionStrategy: FlexibleConnectedPositionStrategy; // 用于定位面板的策略
  private isInsideShadowRoot: boolean; // 元素是否在ShadowRoot组件内部
  private manuallyFloatingLabel = false; // label标签状态是否被覆盖。
  private componentDestroyed = false; // 组件是否销毁
  private overlayAttached = false; // 目录树是否被挂载到overlay
  private isOpenTreePanel = false; // 目录树面板树否展开
  private canOpenOnNextFocus = true; // 能否在下次聚焦时打开。用于防止集中注意力，如果用户切换到另一个浏览器选项卡，然后重新打开，则关闭自动完成功能回来

  constructor(
    private zone: NgZone,
    private overlay: Overlay,
    private localDataService: LocalDataService,
    private catalogService: CatalogService,
    private viewContainerRef: ViewContainerRef,
    private element: ElementRef<HTMLInputElement>,
    @Optional() private dir: Directionality,
    @Optional() @Inject(DOCUMENT) private document: any,
    private changeDetectorRef: ChangeDetectorRef,
    private viewportRuler?: ViewportRuler,
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  // 目录树
  getLevel = (node: ItemFlatNode) => node.level;
  isExpandable = (node: ItemFlatNode) => node.expandable;
  getChildren = (node: ItemNode): ItemNode[] => node.children;
  hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;
  hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.name === '';

  ngOnInit(): void {
    this.dataSource.data = [];
    this.getCatalogTree();
  }

  // 获取目录树信息
  getCatalogTree(): void {
    const userInfo = this.localDataService.getUserInfo();
    const platformList = [];
    if (userInfo.roleList) {
      userInfo.roleList.forEach(v => {
        if (platformList.length > 0 && platformList.every(val => val !== v.platformCode)) {
          platformList.push(v.platformCode);
        } else if (platformList.length === 0) {
          platformList.push(v.platformCode);
        }
      });
    }
    this.catalogService.queryCatalogList(platformList.join(',')).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.dataSource.data = res.data;
        this.initDisplayChips(); // 得到目录树原始数据之后开始初始化已选中的chips
      }
    });
  }

  // 初始化反显用户已经选择的chips
  initDisplayChips(): void {
    this.treeChipsSelected.map(item => {
      const checkItem = item.name.trim();
      const leafNode = this.treeControl.dataNodes.find(v => v.name === checkItem);
      if (leafNode) {
        this.checklistSelection.select(...this.checklistSelection.selected, leafNode);
      }
    });
    this.selectedCataLogList = this.checklistSelection.selected;
  }

  // 变压器将嵌套节点转换为平面节点。在Map中记录节点以供以后使用
  transformer = (node: ItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new ItemFlatNode();
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  // 是否已经选择了该节点之下的所有节点
  descendantsAllSelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  // 是否是部分选择了该节点之下的节点
  descendantsPartiallySelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  // 切换复选框，选择/取消选择所有父子节点上的复选框
  itemSelectionToggle(node: ItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
    descendants.every(child => this.checklistSelection.isSelected(child)); // 强制更新父级
    this.checkAllParentsSelection(node);
  }

  // 切换叶子节点上的复选框，检查所有父节点上是否发生了改变
  leafItemSelectionToggle(node: ItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  // 选择/取消选择叶子节点的时候检查所有父级
  checkAllParentsSelection(node: ItemFlatNode): void {
    let parent: ItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  // 检查根节点的复选框勾选状态并相应地更改
  checkRootNodeSelection(node: ItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  // 获取节点的父节点
  getParentNode(node: ItemFlatNode): ItemFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  // chips输入框获取焦点（不支持事件冒泡）
  handleFocus(event: FocusEvent): void {
    event.stopPropagation();
    this.attachOverlay();
  }

  // chips添加
  add(event: MatChipInputEvent): void {
    const value = event.value;
    // 手动添加项目
    if ((value || '').trim()) {
      const checkItem = value.trim();
      const leafNode = this.treeControl.dataNodes.find(v => v.name === checkItem && !v.expandable);
      if (leafNode) {
        this.checklistSelection.select(...this.checklistSelection.selected, leafNode);
      }
    }
  }

  // chips移除子项
  remove(item: any): void {
    this.selectedCataLogList = this.selectedCataLogList.filter(v => v.name !== item.name);
    this.checklistSelection.deselect(item);
    this.changeDetectorRef.detectChanges();
    this.handleOutsideEmitData();
  }

  // 挂载目录树overlay
  attachOverlay(): void {
    let overlayRef = this.overlayRef;
    if (!overlayRef) {
      this.portal = new TemplatePortal(this.overlayTreePanel, this.viewContainerRef);
      overlayRef = this.overlay.create(this.getOverlayConfig());
      this.overlayRef = overlayRef;
      overlayRef.keydownEvents().subscribe(event => {
        if (event.keyCode === ESCAPE || (event.keyCode === UP_ARROW && event.altKey)) {
          this.closeKeyEventStream.next();
          event.stopPropagation();
          event.preventDefault();
        }
      });
      if (this.viewportRuler) {
        this.viewportRuler.change().pipe(
          // takeUntil(this.onDestroy)
        ).subscribe(() => {
          if (this.panelOpen && overlayRef) {
            overlayRef.updateSize({ width: this.getPanelWidth() });
          }
        });
      }
    } else {
      // 更新触发器，面板宽度和方向，以防万一发生任何变化
      this.positionStrategy.setOrigin(this.getConnectedElement());
      overlayRef.updateSize({ width: this.getPanelWidth() });
    }
    if (overlayRef && !overlayRef.hasAttached()) {
      overlayRef.attach(this.portal);
      this._subscribeToClosingActions(); // 面板挂载之后订阅销毁事件监听
    }
    this.isOpenTreePanel = this.overlayAttached = true;
  }

  // 获取目录树overlay配置信息
  getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      panelClass: ['cataLog-tree-overlay', 'mat-elevation-z4'],
      positionStrategy: this.getOverlayPosition(),
      width: this.getPanelWidth(),
      direction: this.dir
    });
  }

  // 获取overlay的位置信息（定位策略）
  getOverlayPosition(): PositionStrategy {
    const strategy = this.overlay.position()
      .flexibleConnectedTo(this.getConnectedElement())
      .withFlexibleDimensions(false)
      .withPush(false);
    this._setStrategyPositions(strategy);
    this.positionStrategy = strategy;
    return strategy;
  }

  // 位置策略应基于指令元素上的尺寸设置
  private _setStrategyPositions(positionStrategy: FlexibleConnectedPositionStrategy) {
    // 请注意，即使默认情况下下拉列表也提供水平的后备位置width与输入匹配，因为使用者可以覆盖宽度
    const belowPositions: ConnectedPosition[] = [
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }
    ];
    // 连接到触发器的叠加边缘应具有正方形角，而另一端具有圆角。我们应用CSS类来交换根据覆盖位置的边框半径
    const panelClass = 'mat-autocomplete-panel-above';
    const abovePositions: ConnectedPosition[] = [
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass },
      { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', panelClass }
    ];
    let positions: ConnectedPosition[];
    if (this.position === 'above') {
      positions = abovePositions;
    } else if (this.position === 'below') {
      positions = belowPositions;
    } else {
      positions = [...belowPositions, ...abovePositions];
    }
    positionStrategy.withPositions(positions);
  }

  // 获取面板的宽度（目录树overlay）
  getPanelWidth(): number | string {
    return this.getHostWidth();
  }

  // 返回输入元素的宽度，让面板宽度可以匹配它
  getHostWidth(): number {
    return this.getConnectedElement().nativeElement.getBoundingClientRect().width;
  }

  // 获取连接物件（模版）元素
  getConnectedElement(): ElementRef {
    if (this.connectedTo) {
      return this.connectedTo.elementRef;
    }
    return this.formField ? this.formField.getConnectedOverlayOrigin() : this.element;
  }

  // 自动完成面板之外的click点击事件流
  getOutsideClickStream(): Observable<any> {
    return merge(
      fromEvent(this.document, 'click') as Observable<MouseEvent>,
      fromEvent(this.document, 'touchend') as Observable<TouchEvent>)
      .pipe(
        filter(event => {
          // 如果我们在Shadow DOM中，则事件目标将是shadow根，因此我们必须回退以检查click事件路径中的第一个元素
          const clickTarget = (this.isInsideShadowRoot && event.composedPath
            ? event.composedPath()[0]
            : event.target
          ) as HTMLElement;
          const formField = this.formField ? this.formField._elementRef.nativeElement : null;
          return this.overlayAttached && clickTarget !== this.element.nativeElement
            && (!formField || !formField.contains(clickTarget))
            && (!!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget));
        })
      );
  }

  // 此方法关闭面板，如果进行此交互，也会将控件标记为脏源反馈给用户
  setValueAndClose(event: any | null): void {
    if (event && event.source) {
      this.element.nativeElement.focus();
    }
    this.closePanel();
  }

  // 关闭面板（目录树overlay）
  closePanel(): void {
    this.resetLabel();
    if (!this.overlayAttached) {
      return;
    }
    this.isOpenTreePanel = this.overlayAttached = false;
    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
    // 注意，在某些情况下，销毁组件之后可能会最终调用该方法。添加检查以确保我们不会尝试在已破坏的视图上运行更改检测。
    if (!this.componentDestroyed) {
      // 我们需要手动触发变更检测，因为`fromEvent`似乎在适当的时候没有这样做。这样可以确保在用户在外面点击
      this.changeDetectorRef.detectChanges();
    }
    this.selectedCataLogList = this.checklistSelection.selected;
    this.changeDetectorRef.detectChanges();
    this.handleOutsideEmitData();
  }

  // 如果Label已被手动抬高，将使其恢复到正常状态
  resetLabel(): void {
    if (this.manuallyFloatingLabel) {
      this.formField.floatLabel = 'auto';
      this.manuallyFloatingLabel = false;
    }
  }

  // 侦听面板关闭动作流并重置每次选项列表更改时流式传输
  private _subscribeToClosingActions(): Subscription { // 当区域最初稳定时，以及选项列表更改时...
    const firstStable = this.zone.onStable.asObservable().pipe(take(1));
    return merge(firstStable).pipe(
      switchMap(() => { // 创建一个新的panelClosingActions流，替换之前的任何流创建并对其进行展平，以便我们的流仅发出关闭事件...
        if (this.panelOpen) {
          // tslint:disable-next-line:no-non-null-assertion
          this.overlayRef!.updatePosition();
        }
        return this.panelClosingActions;
      }),
      take(1) // 当第一个关闭事件发生时...
    ).subscribe(event => this.setValueAndClose(event));
  }

  // 是否打开目录树overlay面板
  get panelOpen(): boolean {
    return this.overlayAttached;
  }

  // 应关闭自动完成面板的一系列操作，包括当选择一个选项、模糊时以及按下TAB键等等
  get panelClosingActions(): Observable<any | null> {
    return merge(
      this.closeKeyEventStream,
      this.getOutsideClickStream(),
      this.overlayRef ? this.overlayRef.detachments().pipe(filter(() => this.overlayAttached)) : of()
    ).pipe(
      map(event => event ? event : null) // 标准化输出，以便我们返回一致的类型
    );
  }

  // 销毁overlay面板
  destroyPanel(): void {
    if (this.overlayRef) {
      this.closePanel();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  // 使用注入document的defaultView（如果可用）或回退到全局window引用
  getWindow(): Window {
    return this.document?.defaultView || window;
  }

  // Window Blur时的事件处理程序（使用箭头函数为了保留上下文）
  windowBlurHandler = () => {
    // 如果在当前处于焦点状态时用户blur了window，则意味着他们回来时重新聚焦。在这种情况下，如果关闭了window，以避免无意中将其重新打开。
    this.canOpenOnNextFocus = this.document.activeElement !== this.element.nativeElement || this.panelOpen;
  }

  // 处理向外发射事件（对外的主方法）
  handleOutsideEmitData(): void {
    const emitData = this.checklistSelection.selected.map(node => this.flatNodeMap.get(node));
    this.treeChipsSelectChange.emit(emitData);
    if (this.displayError) {
      if (this.checklistSelection.selected && this.checklistSelection.selected.length === 0) {
        this.chipList.errorState = true;
      } else {
        this.chipList.errorState = false;
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    const window = this.getWindow();
    if (typeof window !== 'undefined') {
      window.removeEventListener('blur', this.windowBlurHandler);
    }
    this.componentDestroyed = true;
    this.closeKeyEventStream.complete();
    this.destroyPanel();
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
