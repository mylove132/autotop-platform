import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { timedTaskConf } from '../../../config/base.config';
import { Confirm } from '../../../decorators';
import { AddTimedTaskComponent } from '../../../dialog/add-timed-task';
import { TimedTaskDetailComponent } from '../../../dialog/timed-task-detail';
import { LoadingService } from '../../../services/loading.service';
import { TimedTaskService } from '../../../services/timed-task.service';
import * as BaseUtil from '../../../utils/base.util';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timed-task',
  templateUrl: './timed-task.component.html',
  styleUrls: ['./timed-task.component.scss']
})
export class TimedTaskComponent implements OnInit, OnDestroy {
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  viewBtnToggle = 'task'; // 视图切换, 默认任务视图
  // 任务视图
  status: number; // 定时任务状态, 默认是运行中
  keyword: string; // 定时任务名称
  displayedColumns: string[] = [
    'select', // 复选框
    'name', // 定时任务名称
    'status', // 定时任务状态
    'cron', // crontab表达式
    'createDate', // 创建时间
    'actions' // 操作栏
  ];
  dataSource = new MatTableDataSource(); // 列表信息
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator; // 前端分页
  page = { // 分页 (暂时移除，使用前端分页)
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  timedTask: any[] = []; // 定时任务状态
  selection = new SelectionModel(true, []); // 选中的定时任务
  // 结果视图
  displayedColumnsOfLog: string[] = [
    'id', // 定时任务id
    'name', // 定时任务名称
    'cron', // 定时任务crontab表达式
    'createDate', // 运行结果创建时间
    'actions' // 操作栏
  ];
  dataSourceOfLog = new MatTableDataSource(); // 列表信息
  pageOfLog = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  currentSchedulerId: number; // 当前查看定时任务运行结果的ID

  constructor(
    private router: Router,
    private mToast: Md2Toast,
    private dialog: MatDialog,
    private loadingService: LoadingService,
    private timedTaskService: TimedTaskService
  ) { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.timedTask = timedTaskConf;
    this.getTimedTaskList();
  }

  // 搜索
  search(event: MatSelectChange): void {
    this.status = event.value;
    this.getTimedTaskList();
  }

  // 重置
  rest(): void {
    this.page.pageNumber = 0;
    this.page.size = 10;
    this.status = undefined;
    this.keyword = undefined;
    this.getTimedTaskList();
  }

  // 视图切换
  handleButtonToggle(event: MatButtonToggleChange): void {
    this.getLogList();
  }

  // 获取定时任务数据
  getTimedTaskList(): void {
    this.loadingService.show();
    const data = {
      // limit: this.page.size, // 暂时移除，使用前端分页
      // page: this.page.pageNumber + 1,
      status: this.status,
      name: this.keyword && this.keyword.trim(),
    };
    if (!data.status && data.status !== 0) {
      delete data.status;
    }
    if (!data.name) {
      delete data.name;
    }
    this.timedTaskService.getTimedTaskListByStatus(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        const lists = res.data;
        this.dataSource.data = lists;
        // this.dataSource.data = lists.items;
        // this.page.totalElements = lists.totalItems;
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
    this.getTimedTaskList();
  }

  // 查看定时任务运行结果页
  handleViewLog(row: any): void {
    if (row.taskType === 1) { // 接口
      this.viewBtnToggle = 'log';
      this.currentSchedulerId = row.id;
      this.getLogList();
    } else if (row.taskType === 2) { // jmeter
      this.router.navigate(['/home-page/conference/performance-test'], {
        queryParams: {
          jmeterIds: row.jmeters.map(v => v.id).join(',')
        }
      });
    }
  }

  // 添加
  handleAdd(): void {
    const dialogRef = this.dialog.open(AddTimedTaskComponent, {
      data: {
        title: '新建定时任务'
      },
      maxWidth: '500px'
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getTimedTaskList())
    ).subscribe();
  }

  // 重启
  @Confirm('您确定要重启当前定时任务吗？')
  handleRestart(id: number | number[], batch?: boolean): void {
    this.loadingService.show();
    const data = {
      ids: ([id] as any).flat(Infinity)
    };
    this.timedTaskService.restartTimedTask(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.getTimedTaskList();
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 暂停
  @Confirm('您确定要暂停当前定时任务吗？')
  handlePause(id: number | number[], batch?: boolean): void {
    this.loadingService.show();
    const data = {
      ids: ([id] as any).flat(Infinity)
    };
    this.timedTaskService.pauseTimedTask(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.getTimedTaskList();
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 删除
  @Confirm('您确定要删除吗？')
  handleDelete(id: number | number[], batch?: boolean): void {
    this.loadingService.show();
    const data = {
      ids: ([id] as any).flat(Infinity)
    };
    this.timedTaskService.deleteTimedTask(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.getTimedTaskList();
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 批量暂停
  batchPause(): void {
    if (this.selection.selected.length === 0) {
      this.mToast.toast('请至少选择一个定时任务噢! (╯#-_-)╯~~');
      return;
    }
    const ids = this.selection.selected.map(item => item.id);
    this.handlePause(ids);
  }

  // 批量重启
  batchRestart(): void {
    if (this.selection.selected.length === 0) {
      this.mToast.toast('请至少选择一个定时任务噢! (╯#-_-)╯~~');
      return;
    }
    const ids = this.selection.selected.map(item => item.id);
    this.handleRestart(ids);
  }

  // 批量删除
  batchDelete(): void {
    if (this.selection.selected.length === 0) {
      this.mToast.toast('请至少选择一个定时任务噢! (╯#-_-)╯~~');
      return;
    }
    const ids = this.selection.selected.map(item => item.id);
    this.handleDelete(ids);
  }

  // 编辑
  handleEdit(row: any): void {
    const dialogRef = this.dialog.open(AddTimedTaskComponent, {
      data: {
        data: row,
        title: '编辑定时任务'
      },
      maxWidth: '500px'
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getTimedTaskList())
    ).subscribe();
  }

  // 更多
  handleMore(row: any): void {
    this.dialog.open(TimedTaskDetailComponent, {
        data: row,
        minWidth: '50%'
    });
  }

  // 获取定时任务运行结果
  getLogList(): void {
    this.loadingService.show();
    const data = {
      limit: this.pageOfLog.size,
      page: this.pageOfLog.pageNumber + 1,
      schedulerId: this.currentSchedulerId
    };
    if (!this.currentSchedulerId && this.currentSchedulerId !== 0) {
      delete data.schedulerId;
    }
    this.timedTaskService.getTimedTaskLogBySchedulerId(data).pipe(
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

  // 重置
  restOfLog(): void {
    this.pageOfLog.pageNumber = 0;
    this.pageOfLog.size = 10;
    this.currentSchedulerId = undefined;
    this.getLogList();
  }

  // 查看日志的单个报告
  handleReport(row: any): void {
    window.open(`${BaseUtil.currentDomainAddress()}/taskResult/${row.id}`, '_blank');
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
