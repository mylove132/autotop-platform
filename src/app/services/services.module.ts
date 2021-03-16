import { BaseService } from './base.service';
import { UserService } from './user.service';
import { CatalogService } from './catalog.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from './history.service';
import {RequestService} from './request.service';
import { ConfigService } from './config.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { TokenManageService } from './token-manage.service';
import { OperationRecordsService } from './operation-records.service';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule
  ],
  declarations: [],
  providers: [
    BaseService,
    UserService,
    CatalogService,
    HistoryService,
    RequestService,
    CatalogService,
    ConfigService,
    TokenManageService,
    OperationRecordsService,
  ]
})
export class ServicesModule { }
