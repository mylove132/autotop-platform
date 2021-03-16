import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Md2Toast } from '../../common/toast';
import { LoadingService } from '../../services/loading.service';
import { TimedTaskService } from '../../services/timed-task.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-result',
  templateUrl: './task-result.component.html',
  styleUrls: ['./task-result.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TaskResultComponent implements OnInit {
  dataSource = new MatTableDataSource(); // 列表信息
  expandedElement: null;
  displayedColumns: string[] = [
    'caseName', // 用例名称
    'catalogName', // 目录名称
    'startTime', // 执行时间
    'rumTime', // 执行耗时
    'status', // 执行状态
  ];
  options = { // JSON配置项
    mode: 'view',
    mainMenuBar: false,
    statusBar: false,
    navigationBar: false,
    expandAll: true
  };
  taskId: number; // 定时任务唯一id
  totalCount: number; // 总数
  successCount: number; // 成功
  successRate: number; // 成功率
  failCount: number; // 失败
  failRate: number; // 失败率

  constructor(
    private mToast: Md2Toast,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private timedTaskService: TimedTaskService
  ) {
    this.taskId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getTaskResultList(this.taskId);
  }

  // 获取定时任务执行结果
  getTaskResultList(id: number): void {
    this.loadingService.show();
    this.timedTaskService.queryTimedTaskResultById(id).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        const data = res.data.result || [];
        this.dataSource.data = data;
        this.totalCount = data.length;
        let success = 0;
        let fail = 0;
        data.forEach(element => {
          if (element.status) {
            success++;
          }
          if (!element.status) {
            fail++;
          }
        });
        this.successCount = success;
        this.successRate = Math.floor((success / this.totalCount) * 100);
        this.failCount = fail;
        this.failRate = Math.floor((fail / this.totalCount) * 100);
      } else {
        this.mToast.show('查询失败');
      }
    });
  }

  handleFilter(type: string): void {
    this.dataSource.filter = type;
  }

}
