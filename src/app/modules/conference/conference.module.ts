import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonComponentsModule } from '../../common';
import { PipeModule } from '../../pipes/pipe.module';
import { BaseComponentModule } from './../../common/base-component/base.module';
import { DialogModule } from './../../dialog/dialog.module';
import { ConferenceComponent } from './conference.component';
import { ConferenceRoutingModule } from './conference.routing';
import { ConfigManageComponent } from './config-manage';
import { EndpointManageComponent } from './endpoint-manage';
import { HistoryLogComponent } from './history-log';
import { TimedTaskComponent } from './timed-task';
import { TokenManageComponent } from './token-manage';
import { OperationRecordsComponent } from './operation-records';
import { PerformanceTestComponent } from './performance-test';

// 模块
const DEPENDS = [
  CommonModule,
  FormsModule,
  CommonComponentsModule,
  BaseComponentModule,
  DialogModule,
  PipeModule.forRoot(),
  ConferenceRoutingModule
];

// 组件
const COMPONENTS = [
  ConferenceComponent,
  ConfigManageComponent,
  EndpointManageComponent,
  HistoryLogComponent,
  TimedTaskComponent,
  TokenManageComponent,
  OperationRecordsComponent,
  PerformanceTestComponent,
];

@NgModule({
  imports: [ ...DEPENDS ],
  declarations: [ ...COMPONENTS ]
})

export class ConferenceModule { }
