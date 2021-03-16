import { CommonModule, KeyValuePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { MultiSelectDropDownModule } from '../common/multiselect-dropdown/multiselect-dropdown.module';
import { DirectiveModule } from '../directives/directive.module';
import { PipeModule } from '../pipes/pipe.module';
import { CommonComponentsModule } from './../common/common.module';
import { AddEndpointComponent } from './add-endpoint';
import { AddEnvComponent } from './add-env';
import { ConfirmDeleteComponent } from './confirm-delete/confirm-delete.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { EditCatalogComponent } from './edit-catalog/edit-catalog.component';
import { ReportComponent } from './report/report.component';
import { RequestComponent } from './request/request.component';
import { TooltipComponent } from './tooltip';
import { AddTimedTaskComponent } from './add-timed-task';
import { SettingsComponent } from './settings';
import { AddTokenComponent } from './add-token';
import { SelectToeknModule } from '../common/select-token';
import { OperationRecordsDetailComponent } from './operation-records-detail';
import { HistoryLogDetailComponent } from './history-log-detail';
import { TokenManageDetailComponent } from './token-manage-detail';
import { TimedTaskDetailComponent } from './timed-task-detail';
import { ClipboardModule } from 'ngx-clipboard';
import { AddJmeterComponent } from './add-jmeter';
import { FileUploadModule } from '../common/file-upload';
import { PerformanceTestDetailComponent } from './performance-test-detail';
import { EditEndpointComponent } from './edit-endpoint';
import { RunLogComponent } from './run-log';
import { LogDetailComponent } from './log-detail';
import { AddDbComponent } from './add-db';
import { AddPerfTestComponent } from './add-perf-test';
import { EditJmeterComponent } from './edit-jmeter';

// 模块
const DEPENDS = [
  CommonModule,
  CommonComponentsModule,
  FormsModule,
  ReactiveFormsModule,
  MatRadioModule,
  MatCheckboxModule,
  DirectiveModule,
  MultiSelectDropDownModule.forRoot(),
  PipeModule.forRoot(),
  NgJsonEditorModule,
  SelectToeknModule,
  ClipboardModule,
  FileUploadModule
];

// 组件
export const COMPONENTS = [
  EditCatalogComponent,
  ConfirmDeleteComponent,
  RequestComponent,
  ConfirmComponent,
  AddEnvComponent,
  ReportComponent,
  AddEndpointComponent,
  TooltipComponent,
  AddTimedTaskComponent,
  SettingsComponent,
  AddTokenComponent,
  OperationRecordsDetailComponent,
  HistoryLogDetailComponent,
  TokenManageDetailComponent,
  TimedTaskDetailComponent,
  AddJmeterComponent,
  PerformanceTestDetailComponent,
  EditEndpointComponent,
  RunLogComponent,
  LogDetailComponent,
  AddDbComponent,
  AddPerfTestComponent,
  EditJmeterComponent,
];

@NgModule({
  imports: [...DEPENDS],
  declarations: [...COMPONENTS ],
  providers: [
    KeyValuePipe
  ],
  exports: [...COMPONENTS]
})
export class DialogModule { }
