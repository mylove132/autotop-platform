import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DirectiveModule } from '../directives/directive.module';
import { BaseComponentModule } from './base-component/base.module';
import { CascaderModule } from './cascader/cascader.module';
import { MatSelectSearchModule } from './mat-select-search/mat-select-search.module';
import { NestedSelectodule } from './nested-select';
import { Md2ToastModule } from './toast/index';
import { FuzzySearchComponent } from './fuzzy-search';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeChipsComponent } from './tree-chips';
import { CocoModule } from './coco/coco.module';

export const COMPONENTS = [
  FuzzySearchComponent,
  TreeChipsComponent,
];

const DEPENDS = [
  MatInputModule,
  MatFormFieldModule,
  MatSidenavModule,
  MatIconModule,
  MatCheckboxModule,
  MatCardModule,
  MatToolbarModule,
  MatRadioModule,
  MatBottomSheetModule,
  MatMenuModule,
  MatSelectModule,
  MatButtonModule,
  MatDialogModule,
  MatTabsModule,
  MatTooltipModule,
  MatTreeModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatTableModule,
  MatPaginatorModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
  MatDividerModule,
  MatChipsModule,
  MatProgressBarModule,
  BaseComponentModule,
  Md2ToastModule,
  CascaderModule,
  MatSelectSearchModule,
  MatButtonToggleModule,
  ScrollingModule,
  NestedSelectodule,
  DirectiveModule,
  FormsModule,
  ReactiveFormsModule,
  CocoModule,
  CommonModule
];
@NgModule({
  imports: [
    ...DEPENDS,
  ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS, ...DEPENDS]
})
export class CommonComponentsModule { }
