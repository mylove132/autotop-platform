import { CommunicationComponent } from './communication.component';
import { CommunicationRoutingModule } from './communication.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from './../../dialog/dialog.module';
import { BaseComponentModule } from './../../common/base-component/base.module';
import { FormsModule } from '@angular/forms';
import { CommonComponentsModule } from '../../common';
import { PipeModule } from '../../pipes/pipe.module';
import { SidebarComponent } from './sidebar';
import { RequestTableComponent } from './request-table';
import { DropDirective } from './drag-drop/drop.directive';
import { DragDirective } from './drag-drop/drag.directive';
import { DragDropService } from './drag-drop/drag-drop.service';

// 模块
const DEPENDS = [
  CommonModule,
  FormsModule,
  CommonComponentsModule,
  BaseComponentModule,
  DialogModule,
  CommunicationRoutingModule,
  PipeModule,
];

// 组件or指令
const COMPONENTS = [
  CommunicationComponent,
  SidebarComponent,
  RequestTableComponent,
  DragDirective,
  DropDirective,
];

// 服务
const SERVICES = [
  DragDropService,
];

@NgModule({
  imports: [ ...DEPENDS ],
  declarations: [ ...COMPONENTS ],
  providers: [...SERVICES]
})

export class CommunicationModule { }
