import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { Confirm } from '../../../decorators';
import { AddTokenComponent } from '../../../dialog/add-token';
import { TokenManageDetailComponent } from '../../../dialog/token-manage-detail';
import { LoadingService } from '../../../services/loading.service';
import { RequestService } from '../../../services/request.service';
import { TokenManageService } from '../../../services/token-manage.service';
import { Token } from './token-manage.medel';

@Component({
  selector: 'app-token-manage',
  templateUrl: './token-manage.component.html',
  styleUrls: ['./token-manage.component.scss']
})
export class TokenManageComponent implements OnInit, OnDestroy {
  envId: number; // 环境ID
  platformCodeId: string; // 平台编码
  displayedColumns: string[] = [
    'select', // 复选框
    'username', // 登录用户名
    'env', // 环境
    'platformCode', // 平台
    'updateDate', // 更新时间
    'actions' // 操作栏
  ];
  dataSource = new MatTableDataSource(); // 列表信息
  page = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  envList: any[] = []; // 环境列表
  platformList: any[] = []; // 平台列表
  selection = new SelectionModel(true, []); // 选中的token
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    private mToast: Md2Toast,
    private dialog: MatDialog,
    private loadingService: LoadingService,
    private requestService: RequestService,
    private tokenManageService: TokenManageService
  ) { }

  ngOnInit(): void {
    this.getAllEnvList();
    this.queryPlatformList();
    this.getTokenList();
  }

  // 获取所有环境列表信息
  getAllEnvList(): void {
    this.requestService.getEvnList().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.envList = res.data;
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // 获取所有平台列表信息
  queryPlatformList(): void {
    this.requestService.getPlatformList().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.platformList = res.data;
      }
    });
  }

  // 搜索
  search(event: MatSelectChange, type: string): void {
    if (type === 'env') {
      this.envId = event.value;
    } else if (type === 'platform') {
      this.platformCodeId = event.value;
    }
    this.getTokenList();
  }

  // 重置
  rest(): void {
    this.page.pageNumber = 0;
    this.page.size = 10;
    this.envId = undefined;
    this.platformCodeId = undefined;
    this.getTokenList();
  }

  // 获取Token列表数据
  getTokenList(): void {
    this.loadingService.show();
    const data = {
      limit: this.page.size,
      page: this.page.pageNumber + 1,
      envId: this.envId,
      platformCodeId: this.platformCodeId
    };
    if (!data.envId && data.envId !== 0) {
      delete data.envId;
    }
    if (!data.platformCodeId) {
      delete data.platformCodeId;
    }
    this.tokenManageService.getTokenListByEnvOrPlatformCode(data).pipe(
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

  // 计算所选元素的数量是否与总行数匹配
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // 如果未全部选中，则选择所有行；否则清除选择
  masterToggle(): void {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // 分页
  changePage(mEvent: PageEvent): void {
    this.page.pageNumber = mEvent.pageIndex;
    this.page.size = mEvent.pageSize;
    this.getTokenList();
  }

  // 添加
  handleAdd(): void {
    const dialogRef = this.dialog.open(AddTokenComponent, {
      data: {
        title: '添加Token',
        type: 'add',
        env: this.envList,
        platform: this.platformList
      },
      maxWidth: '580px'
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getTokenList())
    ).subscribe();
  }

  // 查看
  handleView(item: Token): void {
    const dialogRef = this.dialog.open(AddTokenComponent, {
      data: {
        title: '查看Token',
        type: 'view',
        env: this.envList,
        platform: this.platformList,
        item
      },
      maxWidth: '580px'
    });
  }

  // 编辑
  handleEdit(item: Token): void {
    const dialogRef = this.dialog.open(AddTokenComponent, {
      data: {
        title: '编辑Token',
        type: 'edit',
        env: this.envList,
        platform: this.platformList,
        item
      },
      maxWidth: '580px'
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getTokenList())
    ).subscribe();
  }

  // 删除
  @Confirm('您确定要删除吗？')
  handleDelete(id: number | number[], batch?: boolean): void {
    this.loadingService.show();
    const data = {
      ids: batch ? id : [id]
    };
    this.tokenManageService.deleteToken(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.getTokenList();
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 批量删除
  batchDelete(): void {
    if (this.selection.selected.length === 0) {
      this.mToast.toast('请至少选择一个Token噢! (╯#-_-)╯~~');
      return;
    }
    const ids = this.selection.selected.map(item => item.id);
    this.handleDelete(ids);
  }

  // 更多
  handleMore(row: Token): void {
    this.dialog.open(TokenManageDetailComponent, {
        data: row,
        minWidth: '50%'
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
