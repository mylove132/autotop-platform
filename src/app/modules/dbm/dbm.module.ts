import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonComponentsModule } from '../../common';
import { PipeModule } from '../../pipes/pipe.module';
import { DialogModule } from './../../dialog/dialog.module';
import { DbListComponent } from './db-list';
import { DbmComponent } from './dbm.component';
import { DbmRoutingModule } from './dbm.routing';
import { NgJsonEditorModule } from 'ang-jsoneditor';

// 模块
const DEPENDS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonComponentsModule,
    DialogModule,
    PipeModule.forRoot(),
    DbmRoutingModule,
    NgJsonEditorModule,
];

// 组件
const COMPONENTS = [
    DbmComponent,
    DbListComponent,
];

@NgModule({
    imports: [...DEPENDS],
    declarations: [...COMPONENTS]
})

export class DbmModule { }
