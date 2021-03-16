import { Component, ContentChild, Host, Input, OnInit, TemplateRef, ElementRef } from '@angular/core';
import { dropAnimation } from './drop.animation';
import { MenuComponent } from './menu';

@Component({
  selector: 'app-submenu',
  animations: [dropAnimation],
  template: `
    <li [class.el-submenu]="true"
      [class.is-active]="active"
      [class.is-opened]="opened"
      (mouseenter)="mouseenterHandle()"
      (mouseleave)="mouseleaveHandle()">
      <div class="el-submenu__title" (click)="clickHandle()"
        [ngStyle]="{ paddingLeft: '20px;', color: color(),
        borderBottomColor: borderColor() }"
        #subTitle
        (mouseenter)="subTitle.style.backgroundColor = rootMenu.hoverBackgroundColor();
        rootMenu.hoverChange.emit({'index': index, 'status': true});
        subTitle.style.color = '#8981FF'"
        (mouseleave)="subTitle.style.backgroundColor = '';
        rootMenu.hoverChange.emit({'index': index, 'status': false});
        subTitle.style.color = '#FFFFFF'">
        <ng-container *ngIf="!titleTmp">
          {{title}}
        </ng-container>
        <ng-container *ngIf="titleTmp">
          <ng-template [ngTemplateOutlet]="titleTmp"></ng-template>
        </ng-container>
        <mat-icon class="l-submenu__icon-arrow allow-icon" [ngStyle]="{color: color()}" *ngIf="!opened">keyboard_arrow_right</mat-icon>
        <mat-icon class="l-submenu__icon-arrow allow-icon" [ngStyle]="{color: color()}" *ngIf="opened">keyboard_arrow_down</mat-icon>
      </div>
      <ul class="el-menu" [@dropAnimation]="opened"
        [ngStyle]="{ backgroundColor: rootMenu.subBackgroundColor || '' }">
        <ng-content></ng-content>
      </ul>
    </li>
  `,
  styleUrls: ['./menu.css']
})
export class SubmenuComponent implements OnInit {

  @ContentChild('title', {static: false}) titleTmp: TemplateRef<any>;

  @Input() index: string;
  @Input() title: string;
  @Input() activeBackgroundColor: string;

  @Input() parentId: string;
  timer: any;
  opened = false;
  active = false;
  subActive = false;
  dontUserHover = false;

  constructor(
    @Host() public rootMenu: MenuComponent,
  ) {
  }

  mouseenterHandle(): void {
    this.active = true;
    if (this.dontUserHover) { return; }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.rootMenu.openMenu(this.index);
      this.updateOpened();
      clearTimeout(this.timer);
    }, 300);
  }

  mouseleaveHandle(): void {
    this.active = false;
    if (this.dontUserHover) { return; }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.rootMenu.closeMenu(this.index);
      this.updateOpened();
      clearTimeout(this.timer);
    }, 300);
  }

  selectHandle(path: string): void {
    this.rootMenu.selectHandle(this.index, path);
    // selected and close list
    if (this.rootMenu.mode !== 'vertical') {
      this.rootMenu.closeMenu(this.index);
    }
    this.updateOpened();
  }

  updateOpened(): void {
    this.opened = this.rootMenu.openedMenus.indexOf(this.index) > -1;
  }

  clickHandle(): void {
    if (!this.dontUserHover) { return; }
    if (this.opened) {
      this.rootMenu.closeMenu(this.index);
    } else {
      this.rootMenu.openMenu(this.index);
    }
    this.updateOpened();
  }

  borderColor(): string {
    return this.rootMenu.showBorderIndex === this.index ?
      (this.rootMenu.activeTextColor ? this.rootMenu.activeTextColor : '#409eff')
      : 'transparent';
  }

  color() {
    if (this.parentId === this.index) {
      return '#FFFFFF';
    } else if (this.rootMenu.textColor) {
      return this.rootMenu.textColor;
    } else {
      return '';
    }
  }

  ngOnInit(): void {
    this.updateOpened();
    this.active = this.index === this.rootMenu.model;
    this.dontUserHover = this.rootMenu.mode === 'vertical' || this.rootMenu.menuTrigger !== 'hover';
    if (this.index === this.parentId) {
      if (this.opened) {
        this.rootMenu.closeMenu(this.index);
      } else {
        this.rootMenu.openMenu(this.index);
      }
      this.updateOpened();
    }
  }

}
