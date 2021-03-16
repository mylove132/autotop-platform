import { Component, Optional } from '@angular/core';
import { CascaderComponent } from './cascader.component';
import { dropAnimation } from './drop.animation';

@Component({
    selector: 'app-cascader-menu',
    template: `
    <div class="el-cascader-menus"
      style="z-index: 2007; position: absolute; top: 100%; left: 0;"
      [@dropAnimation]="root.menuVisible"
      (click)="clickHandle($event)">
      <ul class="el-cascader-menu" *ngFor="let menuItem of root.steps; let step = index">
        <li *ngFor="let listItem of menuItem; let i = index"
          class="el-cascader-menu__item"
          [class.el-cascader-menu__item--extensible]="listItem.childList"
          [class.is-active]="listItem.active"
          [class.is-disabled]="listItem.elDisabled"
          (click)="root.selectHandle($event, step, i)">
          {{listItem.name}}
          <span class="allow-icon" *ngIf="listItem.childList && listItem.childList.length !==0">&gt;</span>
        </li>
      </ul>
    </div>
    `,
    styleUrls: ['./cascader.component.css'],
    animations: [dropAnimation],
})
export class CascaderMenuComponent {

    constructor(
        @Optional() public root: CascaderComponent,
    ) {
    }

    clickHandle(event: Event): void {
        event.stopPropagation();
    }
}
