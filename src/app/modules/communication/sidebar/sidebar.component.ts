import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { ConfirmDeleteComponent } from '../../../dialog/confirm-delete/confirm-delete.component';
import { EditCatalogComponent } from '../../../dialog/edit-catalog/edit-catalog.component';
import { LocalDataService } from '../../../services/local-data.service';
import { RequestService } from '../../../services/request.service';
import { DropData } from '../drag-drop/drag-data.model';
import { CatalogService } from './../../../services/catalog.service';
import { HistoryService } from './../../../services/history.service';

/**
 * Node for to-do name
 */
export class TodoItemNode {
  children: TodoItemNode[];
  name: string;
  id: number;
  parentId: number;
}

/** Flat to-do name node with expandable and level information */
export class TodoItemFlatNode {
  id: number;
  name: string;
  level: number;
  expandable: boolean;
  parentId: number;
  children: TodoItemNode[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  allCatalogList: any[] = [];
  platformList: any[] = [];
  userPlatformList: any[] = [];
  historyList: any[] = []; // 历史记录列表
  historyDateList: any[] = []; // 历史记录按时间划分列表
  historyPage = {
    page: 1,
    total: 0,
    pageSize: 10,
    maxPage: 1,
  };
  activeId: number; // 当前选中的目录Id
  searchKeyword: string; // 检索关键字
  @Output() select: EventEmitter<any> = new EventEmitter(); // 选中目录事件
  @Output() updateCatalogTree: EventEmitter<void> = new EventEmitter(); // 更新目录树事件
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;

  constructor(
    private localDataService: LocalDataService,
    private catalogService: CatalogService,
    private historyService: HistoryService,
    private requestService: RequestService,
    private dialog: MatDialog,
    private _toast: Md2Toast,
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  getLevel = (node: TodoItemFlatNode) => node && node.level;

  isExpandable = (node: TodoItemFlatNode) => node && node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.name === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  ngOnInit(): void {
    this.queryUserPlatform();
    this.queryList();
  }

  // 获取节点的父节点
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
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

  // 添加节点
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.treeControl.expand(node);
    this.openEditCatalog(parentNode);
  }

  // 更新叶子节点
  updateItem(node: TodoItemFlatNode) {
    const currentNode = this.flatNodeMap.get(node);
    const parentNode = this.getParentNode(node);
    this.treeControl.expand(node);
    this.openEditCatalog(currentNode, true, parentNode && parentNode.name);
  }

  // 删除叶子节点
  deleteItem(node: TodoItemFlatNode) {
    const nestedNode = this.flatNodeMap.get(node);
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '300px',
      data: {
        field: `目录：“${nestedNode.name}”`
      }
    });
    dialogRef.afterClosed().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(result => {
      if (result) {
        this.deleteCatalogNode(nestedNode.id);
      }
    });
  }

  // 删除目录节点
  deleteCatalogNode(id): void {
    this.catalogService.deleteCatalog({
      ids: [id]
    }).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this._toast.toast('删除成功');
        this.queryList();
      } else {
        this._toast.toast('删除失败');
      }
    });
  }

  // 查询历史记录列表
  queryHistoryList() {
    this.historyService.getHistoryLogListByInterfacePath({
      page: this.historyPage.page,
      limit: this.historyPage.pageSize,
    }).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.historyPage.total = res.data.totalItems;
        this.historyPage.maxPage = res.data.pageCount;
        this.historyList = this.historyList.concat(res.data.items);
        const tempData = {};
        this.historyList.forEach(v => {
          const key = moment(v.createDate).format('YYYY-MM-DD');
          if (tempData[key]) {
            tempData[key] = tempData[key].concat(v);
          } else {
            tempData[key] = [v];
          }
        });
        this.historyDateList = Object.entries(tempData);
      }
    });
  }

  // 历史记录 加载更多
  loadMoreHistory() {
    this.historyPage.page++;
    this.queryHistoryList();
  }

  // 查询目录列表
  queryList(activeId?) {
    this.catalogService.queryCatalogList(this.userPlatformList.join(',')).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.dataSource.data = res.data;
        this.allCatalogList = res.data;
        // 默认选中第一个
        if (res.data && res.data.length) {
          this.activeId = activeId || res.data[0].id;
          let activeNode;
          this.flatNodeMap.forEach((value, key) => {
            if (+value.id === +this.activeId) {
              activeNode = key;
            }
          });
          this.expandParentNode(activeNode);
          this.select.emit(this.activeId);
        }
      }
    });
  }

  // 展开该节点及其所有父节点
  expandParentNode(node: TodoItemFlatNode) {
    const parentNode = this.getParentNode(node);
    this.treeControl.expand(node);
    if (parentNode) {
      this.expandParentNode(parentNode);
    } else {
      return;
    }
  }

  // 新建顶级目录
  createParentCatalog(): void {
    this.openEditCatalog({
      id: null,
      name: '无'
    });
  }

  // 获取当前用户的归属平台
  queryUserPlatform(): void {
    const data = this.localDataService.getUserInfo();
    const tempList = [];
    if (data.roleList) {
      data.roleList.forEach(v => {
        if (tempList.length > 0 && tempList.every(val => val !== v.platformCode)) {
          tempList.push(v.platformCode);
        } else if (tempList.length === 0) {
          tempList.push(v.platformCode);
        }
      });
    }
    this.userPlatformList = tempList;
  }

  // 新增/修改目录
  openEditCatalog(row, isUpdate: boolean = false, parentName: string = null): void {
    const data = {
      parentId: isUpdate ? row.parentId : row.id,
      parentName: isUpdate ? parentName : row.name,
      id: isUpdate ? row.id : null,
      name: isUpdate ? row.name : null,
      isPub: isUpdate ? row.isPub : null,
      isUpdate: isUpdate,
      platformCode: row.platformCode
    };
    this.dialog.open(EditCatalogComponent, {
      width: '50%',
      maxWidth: '500px',
      data: data,
      disableClose: true
    }).afterClosed().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(v => {
      if (v) {
        this.queryList(v);
      }
    });
  }

  // 选择目录
  selectItem(node): void {
    const currentNode = this.flatNodeMap.get(node);
    this.activeId = currentNode.id;
    this.select.emit(this.activeId);
  }

  searchItem(): void {
    const tempList = this.tempName(this.allCatalogList, this.searchKeyword);
    this.dataSource.data = tempList;
    // 默认选中第一个
    if (tempList && tempList.length) {
      this.activeId = tempList[0].id;
      let activeNode;
      this.flatNodeMap.forEach((value, key) => {
        if (+value.id === +this.activeId) {
          activeNode = key;
        }
      });
      this.expandParentNode(activeNode);
      this.select.emit(this.activeId);
    }
  }

  tempName(list, string) {
    return list.filter(v => {
      if (v.name.indexOf(string) !== -1) {
        return true;
      } else {
        if (v.children && v.children.length) {
          if (this.tempName(v.children, string).length > 0) {
            return true;
          } else {
            return false;
          }
        }
      }
    });
  }

  // 拖拽放置(含接口和目录)
  handleTreeDrop(mEvent: DropData): void {
    const node = mEvent.drop.data;
    const tag = mEvent.drag.tag;
    if (tag === 'request-table') { // 接口拖拽
      const nodeDetail = this.flatNodeMap.get(node);
      const data = {
        catalogId: nodeDetail.id,
        caseIds: mEvent.drag.data.ids,
      };
      this.requestService.batchUpdateRequest(data).pipe(
        takeUntil(this.onDestroy)
      ).subscribe(res => {
        if (res.result) {
          this._toast.show('操作成功');
          this.updateCatalogTree.emit();
        } else {
          this._toast.show('操作失败');
        }
      });
    } else if (tag === 'tree') { // 目录树拖拽
      if (node !== this.dragNode) {
        const dragNodeDetail = this.flatNodeMap.get(mEvent.drag.data);
        const dropNedeDetail = this.flatNodeMap.get(mEvent.drop.data);
        if (this.dragNodeExpandOverArea === 'above') { // 在目标元素上边[同级]
          // 【PS：目前后端接口暂不支持】
        } else if (this.dragNodeExpandOverArea === 'below') { // 在目标元素下方[同级]
          // 【PS：目前后端接口暂不支持】
        } else { // 在目标元素里[插入此元素的子级]
          const submitData = {
            id: dragNodeDetail.id,
            parentId: dropNedeDetail.id
          };
          this.catalogService.dragAndDropCatalog(submitData).pipe().subscribe(res => {
            if (res.result) {
              this._toast.show('操作成功');
              this.queryList(dragNodeDetail.id);
            } else {
              this._toast.show(res.data);
            }
          });
        }
      }
      this.dragNode = null;
      this.dragNodeExpandOverNode = null;
      this.dragNodeExpandOverTime = 0;
    }
  }

  // 开始拖动目录树
  handleTreeDragStart(event: any): void {
    this.dragNode = event.data;
    this.treeControl.collapse(event.data);
  }

  // 拖动的目录树在目标区域内移动
  handleTreeDragOver(mEvent: any): void {
    mEvent.event.preventDefault();
    const node = mEvent.data;
    const event = mEvent.event;
    // 处理节点展开
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }
    // 处理拖动区域
    const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  // 结束拖拽
  handleTreeDragEnd(event: Event): void {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
