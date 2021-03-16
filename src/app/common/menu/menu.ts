import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul [class]="'el-menu ' + nativeClass"
      [class.el-menu--horizontal]="mode === 'horizontal'"
      [ngStyle]="{ backgroundColor: backgroundColor || '' }" class="sub-menu-scroll">
      <ng-content></ng-content>
    </ul>
  `,
  styleUrls: ['./menu.css']
})
export class MenuComponent {

  @Input() mode = 'vertical';
  @Input() theme = 'light';
  @Input() model: string;
  @Input() nativeClass: string;
  @Input() defaultOpeneds: string[];
  @Input() uniqueOpened = false;
  @Input() menuTrigger = 'hover';
  @Input() backgroundColor: string;
  @Input() subBackgroundColor: string;
  @Input() textColor: string;
  @Input() activeTextColor: string;
  @Input() activeBackgroundColor: string;
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() hoverChange: EventEmitter<any> = new EventEmitter<any>();

  openedMenus: string[] = this.defaultOpeneds ? this.defaultOpeneds.slice(0) : [];
  showBorderIndex: string;

  openMenu(index: string): void {
    const openedMenus = this.openedMenus;
    if (openedMenus.indexOf(index) !== -1) { return; }
    this.openedMenus.push(index);
  }

  closeMenu(index: string): void {
    this.openedMenus.splice(this.openedMenus.indexOf(index), 1);
  }

  selectHandle(index: string, path?: string): void {
    const main: string = path || index;
    this.model = main;
    this.modelChange.emit(main);
  }

  hoverBackgroundColor(): string {
    return '#25265E';
  }

  private hexToRGB(): string {
    const hex: number = + this.backgroundColor.replace('#', '0x');
    // tslint:disable-next-line:no-bitwise
    const rgb: number[] = [(hex & 0xff0000) >> 16, (hex & 0x00ff00) >> 8, hex & 0x0000ff];
    // tslint:disable-next-line:no-bitwise
    return `rgb(${rgb.map(v => ~~(0.8 * v)).join(',')})`;
  }

}
