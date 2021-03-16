import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { take, takeUntil, filter, tap } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { Confirm } from '../../../decorators';
import { ReportComponent } from '../../../dialog/report/report.component';
import { RequestComponent } from '../../../dialog/request/request.component';
import { BaseService } from '../../../services/base.service';
import { LoadingService } from '../../../services/loading.service';
import { RequestService } from '../../../services/request.service';
import { GroupBy, PeriodicElement } from './request-table.model';
import { AddPerfTestComponent } from '../../../dialog/add-perf-test';

@Component({
  selector: 'app-request-table',
  templateUrl: './request-table.component.html',
  styleUrls: ['./request-table.component.scss']
})
export class RequestTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['select', 'id', 'name', 'path', 'paramType', 'type', 'createDate', 'assertText', 'operate'];
  dataSource = new MatTableDataSource<PeriodicElement | GroupBy>();
  endpoint;
  evn;
  id; // 产品线目录树ID
  evns = [];
  endpoints = [];
  selection = new SelectionModel<PeriodicElement | GroupBy>(true, []);
  selectedGroupCaseIds: any[] = []; // 已经选中的分组用例子ID集合
  page = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  dataOrigin = 'catalog'; // 表格数据源: catalog目录 search检索
  searchKeyword: string; // 接口检索关键字
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator; // 前端分页
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  currDataSourceLength = 0; // 当前数据表格的item长度

  constructor(
    private dialog: MatDialog,
    private requestService: RequestService,
    private toast: Md2Toast,
    private baseService: BaseService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.requestService.getEvnList().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.evns = res.data;
        this.evn = res.data[0];
        this.getEndpoint(res.data[0].id);
      } else {
        this.toast.show(res.data, 1800);
      }
    });
  }

  // 产品目录树ID
  setId(id): void {
    this.page.pageNumber = 0;
    this.cleanCheckBoxChecked();
    this.id = id;
    this.getData(this.id);
  }

  // 更新目录Tree
  handleUpdateCatalogTree(): void {
    if (this.currDataSourceLength > 0 && this.page.pageNumber > 0) { // 处理当接口拖拽的时候，非第二页接口被转移完毕之后还在当前页面还在当前页码
      const remainder = this.page.size * (this.page.pageNumber - 1) + this.currDataSourceLength - 1;
      const diff = this.page.size * (this.page.pageNumber - 1);
      if (remainder === diff) {
        this.page.pageNumber = this.page.pageNumber - 1;
      }
    }
    this.getData(this.id);
  }

  // 查询接口用例列表或者根据ID查询对应的接口用例列表
  getData(id?): void {
    if (id) {
      this.dataOrigin = 'catalog';
      const params = {
        catalogId: id, // 目录id【不传默认查询所有用例】
        limit: this.page.size,
        page: this.page.pageNumber + 1,
        envId: this.evn ? this.evn.id : 1
      };
      if (!id) { delete params.catalogId; }
      this.requestService.getRequestList(params).pipe(
        takeUntil(this.onDestroy)
      ).subscribe(res => {
        if (res.result) {
          const data = res.data.items;
          this.currDataSourceLength = res.data.items.length;
          const tableData = [];
          const obj = {};
          for (let i = 0; i < data.length; i++) {
            if (!obj.hasOwnProperty(data[i].path)) {
              obj[data[i].path] = [{
                ids: [data[i].id],
                isGroupBy: true,
                ...data[i]
              }, {
                ...data[i]
              }];
            } else {
              obj[data[i].path][0].ids = [...obj[data[i].path][0].ids, data[i].id];
              obj[data[i].path].push({ ...data[i] });
            }
          }
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const element = obj[key];
              tableData.push(...element);
            }
          }
          this.page.totalElements = res.data.totalItems;
          this.dataSource = new MatTableDataSource<PeriodicElement | GroupBy>(tableData);
        } else {
          this.toast.show(res.data, 1800);
        }
      });
    }
  }

  // 根据环境ID获取Endpoint列表
  getEndpoint(data): void {
    this.requestService.getEndpointList(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(response => {
      if (response.result) {
        this.endpoints = response.data[0].endpoints;
        this.endpoint = response.data[0].endpoints[0];
      } else {
        this.toast.show(response.data, 1800);
      }
    });
  }

  // 切换环境
  changeEvn(): void {
    this.cleanCheckBoxChecked();
    this.getData(this.id);
  }

  // 搜索
  handleSearch(): void {
    this.dataOrigin = 'search';
    this.requestService.getInterfaceCaseListByName({
      name: (this.searchKeyword && this.searchKeyword.trim()) || ''
    }).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        const data = res.data;
        const tableData = [];
        const obj = {};
        for (let i = 0; i < data.length; i++) {
          if (!obj.hasOwnProperty(data[i].path)) {
            obj[data[i].path] = [{
              ids: [data[i].id],
              isGroupBy: true,
              ...data[i]
            }, {
              ...data[i]
            }];
          } else {
            obj[data[i].path][0].ids = [...obj[data[i].path][0].ids, data[i].id];
            obj[data[i].path].push({ ...data[i] });
          }
        }
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            tableData.push(...element);
          }
        }
        this.dataSource = new MatTableDataSource<PeriodicElement | GroupBy>(tableData);
        this.dataSource.paginator = this.paginator; // 客户端分页
      } else {
        this.toast.show(res.data, 1800);
      }
    });
  }

  // 查看
  toDetail(data, group): void {
    const dialogRef = this.dialog.open(RequestComponent, {
      width: '850px',
      disableClose: true,
      data: {
        data: data,
        endpoint: this.endpoint,
        actualEndpoint: group.endpoint, // 实时切换环境下的endpoint
        catalogId: this.id,
        evn: this.evn
      },
    });
    dialogRef.afterClosed().pipe(
      take(1)
    ).subscribe(_ => {
      this.page.pageNumber = 0;
      this.getData(this.id);
    });
  }

  // 删除
  @Confirm('您确定要删除吗？')
  del(data): void {
    this.requestService.delRequest(data.id).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.toast.show('删除成功', 1800);
        this.page.pageNumber = 0;
        this.getData(this.id);
      } else {
        this.toast.show(res.data, 1800);
      }
    });
  }

  // 分页器事件监听
  changePage(mEvent: PageEvent): void {
    this.page.pageNumber = mEvent.pageIndex;
    this.page.size = mEvent.pageSize;
    this.getData(this.id);
  }

  isGroup(index, item): boolean {
    return item.isGroupBy;
  }

  // 分组复选框事件监听
  chackBoxChange(ev: MatCheckboxChange, group: any): void {
    const data = this.dataSource.data as any;
    const ids = data.filter(x => String(x.path) === String(group.path) && x.id).map(x => x.id);
    if (ev.checked) {
      this.selectedGroupCaseIds = Array.from(new Set([...ids, ...this.selectedGroupCaseIds]));
    } else {
      this.selectedGroupCaseIds = this.diffArray(this.selectedGroupCaseIds, ids);
    }
  }

  // 设置复选框的勾选状态
  setCheckBoxChecked({ id }): boolean {
    return this.selectedGroupCaseIds.includes(id);
  }

  // 比价两个数组中的差异元素并返回去重之后的新数组
  diffArray(input: any, ...args: any[]): any {
    if (!Array.isArray(input)) {
      return input;
    }
    // tslint:disable-next-line no-bitwise
    return args.reduce((d, c) => d.filter((e: any) => !~c.indexOf(e)), input);
  }

  // 清空所有复选框状态（含分组）
  cleanCheckBoxChecked(): void {
    this.selectedGroupCaseIds = [];
    this.selection.clear();
  }

  // 添加
  addRequest(data): void {
    const dialogRef = this.dialog.open(RequestComponent, {
      width: '850px',
      disableClose: true,
      data: {
        addData: data,
        endpoint: this.endpoint,
        catalogId: this.id,
        evn: this.evn
      }
    });
    dialogRef.afterClosed().pipe(
      take(1)
    ).subscribe(_ => {
      this.page.pageNumber = 0;
      this.getData(this.id);
    });
  }

  // 添加接口
  addInterface() {
    const dialogRef = this.dialog.open(RequestComponent, {
      width: '850px',
      disableClose: true,
      data: {
        catalogId: this.id,
        endpoint: this.endpoint
      }
    });
    dialogRef.afterClosed().pipe(
      take(1)
    ).subscribe(_ => {
      this.page.pageNumber = 0;
      this.getData(this.id);
    });
  }

  // 运行用例（单个）
  operateSingleRequest(id: number): void {
    const data = {
      caseIds: [id],
      envId: this.evn.id,
    };
    this.requestService.operateRequest(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.baseService.loading = false;
      if (res.result) {
        this.toast.show('运行成功', 1800);
        this.report(res.data);
      } else {
        this.toast.show(res.data, 1800);
      }
    });
  }

  // 运行
  operateRequest(group): void {
    this.baseService.loading = true;
    const data = this.dataSource.data as any;
    const ids = data.filter(x => String(x.path) === String(group.path) && x.id).map(x => x.id);
    const base_body = {
      caseIds: Array.from(new Set(ids)),
      envId: this.evn.id,
    };
    this.requestService.operateRequest(base_body).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.baseService.loading = false;
      if (res.result) {
        this.toast.show('运行成功', 1800);
        this.report(res.data);
      } else {
        this.toast.show(res.data, 1800);
      }
    });
  }

  // 添加性能测试
  addPerfTest(): void {
    const batchIds =  Array.from(new Set([...this.selection.selected.map(v => v.id), ...this.selectedGroupCaseIds])) || [];
    const body = {
      caseIds: batchIds,
      envId: this.evn.id,
      catalogId: this.id,
      evnList: this.evns, // 环境列表
    };
    const dialogRef = this.dialog.open(AddPerfTestComponent, {
      data: {
        title: '创建压测信息',
        type: 'add',
        item: {...body}
      },
      maxWidth: '50%',
      autoFocus: false
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => _)
    ).subscribe();
  }

  // 批量运行
  batchOperateRequest(): void {
    const batchIds =  Array.from(new Set([...this.selection.selected.map(v => v.id), ...this.selectedGroupCaseIds])) || [];
    if (batchIds.length === 0) {
      this.toast.show('请至少选择一个用例噢! (╯#-_-)╯~~');
      return;
    }
    const body = {
      caseIds: batchIds,
      envId: this.evn.id
    };
    this.loadingService.show();
    this.requestService.operateRequest(body).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.toast.show('运行成功', 1800);
        this.report(res.data);
      } else {
        this.toast.show(res.data, 1800);
      }
      this.loadingService.hide();
    });
  }

  // 报告面板
  report(data): void {
    const dialogRef = this.dialog.open(ReportComponent, {
      width: '850px',
      data: { data: data },
    });
    dialogRef.afterClosed().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(_ => {
      this.page.pageNumber = 0;
      this.getData(this.id);
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

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
