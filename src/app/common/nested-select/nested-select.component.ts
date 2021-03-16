import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Options } from './select-item/select-item.model';

@Component({
  selector: 'app-nested-select',
  templateUrl: './nested-select.component.html',
  styleUrls: ['./nested-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestedSelectComponent implements OnInit {
  @Input() nodes: any[]; // 源数据
  @Input() options: Options = {}; // 配置项
  @Input() disabled: boolean; // 是否禁用控件
  @Output() leafSelectedChange = new EventEmitter<{data: string, id: string}>();
  @ViewChild('menuTrigger') menu: MatMenuTrigger;
  public displayLabel: string; // 显示选中的Item

  get childrenField(): string { return this.options.childrenField || 'children'; }
  get displayField(): string { return this.options.displayField || 'displayName'; }
  get iconField(): string { return this.options.iconField || 'iconName'; }
  get idField(): string { return this.options.idField || 'id'; }
  get useFullLabel(): boolean { return this.options.useFullLabel || false; }
  get multiply(): boolean { return this.options.multiply || false; }
  get displayPlaceholder(): string { return this.options.placeholder || '请选择'; }

  constructor() { }

  ngOnInit(): void {
    if (!this.multiply) {
      this.nodes = this.dynamicSetRootNode();
    }
  }

  // 动态设置根节点
  dynamicSetRootNode(): any[] {
    const arr = [];
    const obj = {};
    obj[this.idField] = 0;
    obj[this.displayField] = 'root';
    obj[this.childrenField] = [...this.nodes];
    arr.push(obj);
    return arr;
  }

  // 叶子节点根节点回调
  onSelectChange(mEvent: {data: string, id: string, node: any}): void {
    console.log('根节点回调🍒', mEvent);
    this.displayLabel = mEvent.data;
    this.menu.toggleMenu();
    if (!this.multiply) {
      const newData = mEvent.data.slice(mEvent.data.indexOf('/') + 1);
      const newId = mEvent.id.slice(mEvent.id.indexOf(',') + 1);
      this.leafSelectedChange.emit(Object.assign({}, {
        data: newData,
        id: newId,
        node: mEvent.node
      }));
    } else {
      this.leafSelectedChange.emit(mEvent);
    }
  }

  // 展示节点名
  displayName(child: any): string {
    return child[this.displayField];
  }

  // 是否是枝干节点
  hasChildrenNode(child: any): boolean {
    return child[this.childrenField] && child[this.childrenField].length > 0;
  }

  // 是否是叶子节点
  hasLeafNode(child: any): boolean {
    return !child[this.childrenField] || child[this.childrenField].length === 0;
  }

  // 是否展示选中的叶子节点信息
  hasDisplay(): boolean {
    return this.displayLabel ? true : false;
  }

  // 是否显示全路径
  hasDisplayLabel(label: string): string {
    return this.useFullLabel ? label && label.slice(label.indexOf('/') + 1) : label && label.split('/').pop();
  }

}
