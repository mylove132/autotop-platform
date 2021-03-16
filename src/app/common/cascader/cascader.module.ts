import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CascaderComponent } from './cascader.component';
import { CascaderMenuComponent } from './cascader.menu';


@NgModule({
  declarations: [CascaderComponent, CascaderMenuComponent],
  exports: [CascaderComponent, CascaderMenuComponent],
  imports: [CommonModule]
})
export class CascaderModule {
  static forRoot(): ModuleWithProviders<CascaderModule> {
    return { ngModule: CascaderModule, providers: [] };
  }
}
