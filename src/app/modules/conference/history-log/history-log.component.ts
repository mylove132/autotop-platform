import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { HistoryLogDetailComponent } from '../../../dialog/history-log-detail';
import { HistoryService } from '../../../services/history.service';
import { LoadingService } from '../../../services/loading.service';
import { HistoryLog } from './history-log.model';

@Component({
    selector: 'app-history-log',
    templateUrl: './history-log.component.html',
    styleUrls: ['./history-log.component.scss']
})
export class HistoryLogComponent implements OnInit, OnDestroy {
    keyPath: string; // 检索关键路径
    displayedColumns: string[] = [
        'caseName',         // 接口名称
        'casePath',         // 接口Url
        'caseType',         // 请求类型
        'caseCreateDate',   // 接口创建时间
        'logExecutor',      // 执行者
        'logCreateDate',    // 历史记录创建时间
        'actions', // 操作
    ];  // 定制Table显示列
    page = { // 分页
        pageNumber: 0,
        size: 10,
        totalElements: 0
    };
    dataSource = new MatTableDataSource<HistoryLog>(); // 列表信息
    private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

    constructor(
        private mToast: Md2Toast,
        private dialog: MatDialog,
        private loadingService: LoadingService,
        private historyService: HistoryService
    ) { }

    ngOnInit(): void {
        this.getHistoryLogList();
    }

    // 搜索
    search(): void {
        this.getHistoryLogList();
    }

    // 根据接口路径获取历史记录
    getHistoryLogList(): void {
        this.loadingService.show();
        const data = {
            limit: this.page.size,
            page: this.page.pageNumber + 1,
            path: this.keyPath || ''
        };
        this.historyService.getHistoryLogListByInterfacePath(data).pipe(
            takeUntil(this.onDestroy)
        ).subscribe(res => {
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
        this.getHistoryLogList();
    }

    // 更多
    handleMore(row: HistoryLog): void {
        this.dialog.open(HistoryLogDetailComponent, {
            data: row,
            minWidth: '70%'
        });
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

}
