import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { AddJmeterComponent } from '../../../dialog/add-jmeter';
import { Md2Toast } from '../../../common/toast';
import { Confirm } from '../../../decorators';
import { PerformanceTestDetailComponent } from '../../../dialog/performance-test-detail';
import { LoadingService } from '../../../services/loading.service';
import { PerformanceTestService } from '../../../services/performance-test.service';
import { SocketioService } from '../../../services/socketio.service';
import { RunLogComponent } from '../../../dialog/run-log';
import { LogDetailComponent } from '../../../dialog/log-detail';
import { ActivatedRoute } from '@angular/router';
import { EditJmeterComponent } from 'src/app/dialog/edit-jmeter';

@Component({
  selector: 'app-performance-test',
  templateUrl: './performance-test.component.html',
  styleUrls: ['./performance-test.component.scss']
})
export class PerformanceTestComponent implements OnInit, OnDestroy {
  viewBtnToggle = 'script'; // 视图切换, 默认脚本视图
  // 脚本视图
  keyword: string; // 压测脚本名称
  displayedColumns: string[] = [
    'select', // 复选框
    'name', // 压测脚本名称
    'preCountNumber', // 压测总线程数
    'preCountTime', // 压测总时长（s）
    'loopNum', // 压测循环次数
    'createDate', // 日志创建时间
    'updateDate', // 更新时间
    'actions' // 操作栏
  ];
  dataSource = new MatTableDataSource(); // 列表信息
  page = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  selection = new SelectionModel(true, []); // 选中的压测脚本
  // 日志视图
  keywordOfLog: string; // 模糊匹配脚本名称
  displayedColumnsOfLog: string[] = [
    'name', // 压测脚本名称
    'preCountNumber', // 压测总线程数
    'preCountTime', // 压测总时长（s）
    'loopNum', // 压测循环次数
    'jmeterRunStatus', // 执行状态
    'createDate', // 日志创建时间
    'actions' // 操作栏
  ];
  dataSourceOfLog = new MatTableDataSource(); // 列表信息
  pageOfLog = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  jmeterIds: any[] = []; // jmeter脚本Id集合，主要是定时任务跳转过来需要

  constructor(
    private mToast: Md2Toast,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    public socketService: SocketioService,
    private performanceTestService: PerformanceTestService
  ) {
    this.route.queryParamMap.subscribe(params => {
      if (!params.has('jmeterIds')) { return; }
      this.jmeterIds = params.get('jmeterIds').split(',').map(Number);
    });
  }

  ngOnInit(): void {
    if (this.jmeterIds.length > 0) {
      this.handleViewLog(this.jmeterIds, true);
    }
    this.getScriptList();
    this.socketService.setupSocketConnection();
  }

  // 搜索
  search(): void {
    this.getScriptList();
  }

  // 重置
  rest(): void {
    this.page.pageNumber = 0;
    this.page.size = 10;
    this.keyword = undefined;
    this.getScriptList();
  }

  // 视图切换
  handleButtonToggle(event: MatButtonToggleChange): void {
    if (event.value === 'script') { // 脚本
      this.getScriptList();
    } else if (event.value === 'log') { // 结果
      this.getLogList();
    }
  }

  // 获取脚本列表数据
  getScriptList(): void {
    this.loadingService.show();
    const data = {
      limit: this.page.size,
      page: this.page.pageNumber + 1,
      name: this.keyword && this.keyword.trim()
    };
    if (!data.name) {
      delete data.name;
    }
    this.performanceTestService.queryJemeterList(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        const lists = res.data;
        (lists.items || []).map(v => {
          const obj = {};
          obj[v.id] = {
            state: 1,
            log: ''
          };
          this.socketService.log = { ...this.socketService.log, ...obj };
        });
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
    this.getScriptList();
  }

  // 查看脚本运行日志
  handleViewLog(row: any, isRouter: boolean = false): void {
    this.viewBtnToggle = 'log';
    const data = {
      ids: isRouter ? row : [row.id]
    };
    this.performanceTestService.queryJemeterLogById(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        const lists = res.data;
        const temp = (lists.items || []).map(v => Object.assign({}, v, {
          jmeter: row
        }));
        this.dataSourceOfLog.data = temp;
        this.pageOfLog.totalElements = lists.totalItems;
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // 创建
  handleAdd(): void {
    const dialogRef = this.dialog.open(AddJmeterComponent, {
      data: {
        title: '创建压测信息',
        type: 'add'
      },
      maxWidth: '50%',
      autoFocus: false
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getScriptList())
    ).subscribe();
  }

  // 运行
  handleRun(item: any, state: number): void {
    if (state === 1) {
      this.socketService.emitSocketEvent(item.id);
    } else {
      this.dialog.open(RunLogComponent, {
        data: item.id,
        width: '70vw',
        height: '80vh'
      });
    }
  }

  // 查看
  handleView(item: any): void {
    this.dialog.open(AddJmeterComponent, {
      data: {
        title: '查看压测信息',
        type: 'view',
        item
      },
      maxWidth: '50%'
    });
  }

  // 编辑
  handleEdit(item: any): void {
    // const dialogRef = this.dialog.open(AddJmeterComponent, {
    //   data: {
    //     title: '编辑压测信息',
    //     type: 'edit',
    //     item
    //   },
    //   maxWidth: '50%'
    // });
    // dialogRef.afterClosed().pipe(
    //   take(1),
    //   filter(result => result),
    //   tap(_ => this.getScriptList())
    // ).subscribe();


    // 暂时不开放
    const dialogRef = this.dialog.open(EditJmeterComponent, {
      data: {
        title: '编辑压测信息',
        type: 'edit',
        item
      },
      minWidth: '50%'
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getScriptList())
    ).subscribe();
  }

  // 删除
  @Confirm('您确定要删除吗？')
  handleDelete(id: number | number[], batch?: boolean): void {
    this.loadingService.show();
    const data = {
      ids: batch ? id : [id]
    };
    this.performanceTestService.deleteJmeter(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.getScriptList();
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 批量删除
  batchDelete(): void {
    if (this.selection.selected.length === 0) {
      this.mToast.toast('请至少选择一个脚本噢! (╯#-_-)╯~~');
      return;
    }
    const ids = this.selection.selected.map(item => item.id);
    this.handleDelete(ids);
  }

  // 更多
  handleMore(row: any): void {
    this.dialog.open(PerformanceTestDetailComponent, {
      data: {
        item: row,
        type: 'script'
      },
      minWidth: '50%'
    });
  }

  // 获取脚本运行的日志列表
  getLogList(): void {
    this.loadingService.show();
    const data = {
      limit: this.pageOfLog.size,
      page: this.pageOfLog.pageNumber + 1,
      name: this.keyword && this.keyword.trim()
    };
    if (!data.name) {
      delete data.name;
    }
    this.performanceTestService.watchMultiplyJmeter(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        const lists = res.data;
        this.dataSourceOfLog.data = lists.items;
        this.pageOfLog.totalElements = lists.totalItems;
      } else {
        this.mToast.show(res.data);
      }
      this.loadingService.hide();
    });
  }

  // 分页
  changePageOfLog(mEvent: PageEvent): void {
    this.pageOfLog.pageNumber = mEvent.pageIndex;
    this.pageOfLog.size = mEvent.pageSize;
    this.getLogList();
  }

  // 搜索
  searchOfLog(): void {
    this.getLogList();
  }

  // 重置
  restOfLog(): void {
    this.pageOfLog.pageNumber = 0;
    this.pageOfLog.size = 10;
    this.keywordOfLog = undefined;
    this.getLogList();
  }

  // 查看日志的单个报告
  handleReport(row: any): void {
    const data = {
      md5: row.md5
    };
    this.performanceTestService.watchSingleJmeter(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        if (!res.data?.url) {
          this.mToast.show('报告链接不存在，无法查看～');
          return;
        }
        window.open(res.data?.url, '_blank');
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // 日志
  handleLog(row: any): void {
    const data = {
      md5: row.md5
    };
    this.performanceTestService.watchJmeterLog(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.dialog.open(LogDetailComponent, {
          data: res.data,
          width: '70vw',
          height: '80vh'
        });
      }
    });
  }

  // 更多（日志视图）
  handleMoreOfLog(row: any): void {
    this.dialog.open(PerformanceTestDetailComponent, {
      data: {
        item: row,
        type: 'log'
      },
      minWidth: '50%'
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.socketService.disconnectSocketConnection();
  }

}
