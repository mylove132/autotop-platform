import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from './menu-item';
import { SubmenuComponent } from './submenu';
import { MenuComponent } from './menu';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [MenuComponent, SubmenuComponent, MenuItemComponent],
  exports: [MenuComponent, SubmenuComponent, MenuItemComponent],
  imports: [CommonModule, MatIconModule]
})
export class MenusModule {
  static forRoot(): ModuleWithProviders<MenusModule> {
    return { ngModule: MenusModule, providers: [] };
  }
}
