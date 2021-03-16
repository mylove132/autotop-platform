import { Component, Input, OnInit, ElementRef, Optional, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuComponent } from './menu';
import { SubmenuComponent } from './submenu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-item',
  template: `
    <li class="el-menu-item" (click)="clickHandle()" #list
      [ngStyle]="{ paddingLeft: '20px',
      borderBottomColor: borderColor(),
      backgroundColor: setBackground(),
      color: color() }"
      (mouseenter)="list.style.backgroundColor = isSubMenu ? '#1A1545' : '#25265E';
      rootMenu.hoverChange.emit({'index': index, 'status': true});
      list.style.color = '#8981FF'"
      (mouseleave)="list.style.backgroundColor = setBackground();
      rootMenu.hoverChange.emit({'index': index, 'status': false});
      list.style.color = '#FFFFFF'"
      [class.is-active]="rootMenu.model === index"
      [class.is-disabled]="elDisabled">
      <ng-content></ng-content>
    </li>
  `,
  styleUrls: ['./menu.css']
})
export class MenuItemComponent implements OnInit {

  @Input() set disabled(val: boolean) {   // todo, is discarded.
    console.warn('(disabled) is discarded, use [elDisabled] replace it.');
  }
  @Input() elDisabled = false;
  @Input() index: string;
  @Input() title = '';
  @Input() to: string;
  @Input() isSubMenu;
  @Input() extras?: any = {};
  @Output() routerClick: EventEmitter<any> = new EventEmitter<any>();
  private inSubmenu = false;
  isParentTag = (nativeElement: HTMLElement, parentTag: string): boolean => {
    let parentIsTag = false;
    let parent = nativeElement.parentElement;
    let findLen = 3, lowerName = '';
    while (findLen) {
      lowerName = parent.localName.toLowerCase();
      if (lowerName.indexOf('el') > -1) {
        parentIsTag = lowerName === parentTag;
        findLen = 0;
      } else {
        parent = parent.parentElement;
        findLen --;
      }
    }
    return parentIsTag;
  }
  removeNgTag = (nativeElement: HTMLElement): void => {
    const parentElement = nativeElement.parentElement;
    if (!parentElement || !parentElement.insertBefore) { return; }
    while (nativeElement.firstChild) {
      parentElement.insertBefore(nativeElement.firstChild, nativeElement);
    }
    parentElement.removeChild(nativeElement);
  }

  constructor(
    @Optional() public rootMenu: MenuComponent,
    @Optional() private subMenu: SubmenuComponent,
    private sanitizer: DomSanitizer,
    private el: ElementRef,
    private router: Router,
  ) {
  }

  clickHandle(): void {
    this.routerClick.emit();
    const comRef: any = this.subMenu || this.rootMenu;
    comRef.selectHandle(this.index);
    const nextBorderIndex: string = (this.inSubmenu && this.subMenu) ? this.subMenu.index : this.index;
    this.rootMenu.showBorderIndex = nextBorderIndex;
    if (String(this.to).indexOf('home-page') === -1) {
      this.router.navigate(['home-page/data-dashboard'], {queryParams: {t: this.to}});
    } else {
      // tslint:disable-next-line:no-unused-expression
      this.to && this.router.navigateByUrl(this.to, this.extras);
    }
  }

  borderColor(): string {
    // not show border in group
    const dontShowBorder = this.inSubmenu && this.subMenu;
    if (dontShowBorder) {
      return 'transparent';
    }
    return this.rootMenu.showBorderIndex === this.index ?
      (this.rootMenu.activeTextColor ? this.rootMenu.activeTextColor : '')
      : 'transparent';
  }

  setBackground(): string {
    if (this.rootMenu.showBorderIndex === this.index || this.rootMenu.model === this.index) {
      if (this.rootMenu.activeTextColor) {
        return this.rootMenu.activeBackgroundColor;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  color(): string {
    return this.rootMenu.model === this.index ?
      (this.rootMenu.activeTextColor ? this.rootMenu.activeTextColor : '#409eff')
      : this.rootMenu.textColor ? this.rootMenu.textColor : '#909399';
  }

  ngOnInit(): void {
    this.inSubmenu = this.isParentTag(this.el.nativeElement, 'app-submenu');
    this.removeNgTag(this.el.nativeElement);
  }

}

