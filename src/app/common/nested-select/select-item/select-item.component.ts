import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NestedSelectComponent } from '../nested-select.component';
import { Options } from './select-item.model';

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.component.html',
  styleUrls: ['./select-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectItemComponent {
  @Input() items: any[];
  @Input() parent: any;
  @ViewChild('childMenu', { static: true }) public childMenu: any;
  @Output() selectChange = new EventEmitter();
  @Input() options: Options = {};

  get childrenField(): string { return this.options.childrenField || 'children'; }
  get displayField(): string { return this.options.displayField || 'displayName'; }
  get iconField(): string { return this.options.iconField || 'iconName'; }
  get idField(): string { return this.options.idField || 'id'; }
  get branchClick(): boolean { return this.options.branchClick || false; }

  constructor(
    private component: NestedSelectComponent
  ) {
    this.options = this.component.options;
  }

  // 展示节点名
  displayName(child: any): string {
    return child[this.displayField];
  }

  // 展示图标
  displayIcon(child: any): string {
    return child[this.iconField];
  }

  // 是否有图标
  hasIcon(child: any): boolean {
    return child[this.iconField];
  }

  // 是否是枝干节点
  hasChildrenNode(child: any): boolean {
    return child[this.childrenField] && child[this.childrenField].length > 0;
  }

  // 是否是叶子节点
  hasLeafNode(child: any): boolean {
    return !child[this.childrenField] || child[this.childrenField].length === 0;
  }

  // 叶子节点点击事件
  onLeafClick(item: any) {
    console.log('叶子节点点击事件🍎: ', item);
    this.selectChange.emit({
      data: this.parent[this.displayField] + '/' + item[this.displayField],
      id: this.parent[this.idField] + ',' + item[this.idField],
      node: item
    });
  }

  // 枝干节点点击事件
  onBranchClick(item: any) {
    console.log('枝干节点点击事件🍐: ', item);
    if (!this.branchClick) { return; }
    this.selectChange.emit({
      data: this.parent[this.displayField] + '/' + item[this.displayField],
      id: this.parent[this.idField] + ',' + item[this.idField],
      node: item
    });
  }

  // 叶子节点选择事件
  onSelectLeafChange(item: {data: string, id: string, node: any}) {
    this.selectChange.emit({
      data: this.parent[this.displayField] + '/' + item.data,
      id: this.parent[this.idField] + ',' + item[this.idField],
      node: item.node
    });
  }

}
