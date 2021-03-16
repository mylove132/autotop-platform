import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { OperationRecordsDetailComponent } from '../../../dialog/operation-records-detail';
import { LoadingService } from '../../../services/loading.service';
import { OperationRecordsService } from '../../../services/operation-records.service';
import { operationModleConf, operationTypeConf } from './../../../config/base.config';
import { OperationRecords } from './operation-records.model';

@Component({
  selector: 'app-operation-records',
  templateUrl: './operation-records.component.html',
  styleUrls: ['./operation-records.component.scss']
})
export class OperationRecordsComponent implements OnInit, OnDestroy {
  userId: number; // 用户ID
  operateModule: number; // 操作模块
  operateType: number; // 操作类型
  keyword: string; // 请求参数关键字
  displayedColumns: string[] = [
    'operateModule', // 操作模块
    'operateType', // 操作类型
    'operateUri', // 请求路径
    'operateIp', // 请求者IP
    'user', // 请求者用户名
    'createDate', // 创建时间
    'actions', // 操作
  ];
  dataSource = new MatTableDataSource<OperationRecords>(); // 列表信息
  page = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  userList: any[] = []; // 用户列表
  operationModuleList: any[] = []; // 操作模块列表
  operateTypeList: any[] = []; // 操作类型列表
  selection = new SelectionModel(true, []); // 选中的token
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    private mToast: Md2Toast,
    private dialog: MatDialog,
    private loadingService: LoadingService,
    private operationRecordsService: OperationRecordsService
  ) { }

  ngOnInit(): void {
    this.operationModuleList = operationModleConf;
    this.operateTypeList = operationTypeConf;
    this.getAllUserList();
    this.getOperationRecordsList();
  }

  // 获取所有用户列表信息
  getAllUserList(): void {
    this.operationRecordsService.queryAllUsers().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.userList = res.data;
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // 搜索
  search(event: MatSelectChange, type: string): void {
    if (type === 'user') {
      this.userId = event.value;
    } else if (type === 'module') {
      this.operateModule = event.value;
    } else if (type === 'type') {
      this.operateType = event.value;
    } else if (type === 'keyword') {
      this.keyword = this.keyword ? this.keyword.trim() : '';
    }
    this.getOperationRecordsList();
  }

  // 重置
  rest(): void {
    this.page.pageNumber = 0;
    this.page.size = 10;
    this.userId = undefined;
    this.operateModule = undefined;
    this.operateType = undefined;
    this.keyword = undefined;
    this.getOperationRecordsList();
  }

  // 获取操作记录列表
  getOperationRecordsList(): void {
    this.loadingService.show();
    const data = {
      limit: this.page.size,
      page: this.page.pageNumber + 1,
      userId: this.userId,
      operateModule: this.operateModule,
      operateType: this.operateType,
      keyword: this.keyword
    };
    if (!data.userId && data.userId !== 0) {
      delete data.userId;
    }
    if (!data.operateModule) {
      delete data.operateModule;
    }
    if (!data.operateType) {
      delete data.operateType;
    }
    if (!data.keyword) {
      delete data.keyword;
    }
    this.operationRecordsService.getOperationRecordsByContidion(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        const lists = res.data;
        this.dataSource.data = lists.items;
        this.page.totalElements = lists.totalItems;
      } else {
        this.mToast.show(res.data);
      }
      this.loadingService.hide();
    });
  }

  // 分页
  changePage(mEvent: PageEvent): void {
    this.page.pageNumber = mEvent.pageIndex;
    this.page.size = mEvent.pageSize;
    this.getOperationRecordsList();
  }

  // 更多
  handleMore(row: OperationRecords): void {
    this.dialog.open(OperationRecordsDetailComponent, {
      data: row,
      minWidth: '70%'
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
