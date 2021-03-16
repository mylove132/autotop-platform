import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { AddEnvComponent } from '../../../dialog/add-env';
import { ConfirmComponent } from '../../../dialog/confirm';
import { ConfigService } from '../../../services/config.service';
import { LoadingService } from '../../../services/loading.service';
import { RequestService } from '../../../services/request.service';
import { EnvList } from './config-manage.model';

@Component({
    selector: 'app-config-manage',
    templateUrl: './config-manage.component.html',
    styleUrls: ['./config-manage.component.scss']
})
export class ConfigManageComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['select', 'serial', 'id', 'name'];    // 定制Table显示列
    dataSource = new MatTableDataSource<EnvList>();                     // 列表信息
    selection = new SelectionModel<EnvList>(true, []);                  // 选中的环境
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator; // Table分页
    private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

    constructor(
        private mToast: Md2Toast,
        private dialog: MatDialog,
        private configService: ConfigService,
        private requestService: RequestService,
        private loadingService: LoadingService
    ) { }

    ngOnInit(): void {
        this.getAllEnvList();
        this.dataSource.paginator = this.paginator;
    }

    // 获取所有环境列表信息
    getAllEnvList(): void {
        this.loadingService.show();
        this.requestService.getEvnList().pipe(
            takeUntil(this.onDestroy)
        ).subscribe(res => {
            if (res.result) {
                this.dataSource.data = res.data;
            } else {
                this.mToast.show(res.data);
            }
            this.loadingService.hide();
        });
    }

    // 添加
    add(): void {
        const dialogOptions = {
            width: '50%',
            maxWidth: '500px',
            data: '',
            disableClose: true
        };
        const dialogRef = this.dialog.open(AddEnvComponent, dialogOptions);
        dialogRef.afterClosed().pipe(
            takeUntil(this.onDestroy)
        ).subscribe((confirmed: boolean) => {
            if (confirmed) {
              this.getAllEnvList();
            }
        });
    }

    /**
     * 删除（含批量删除）
     * @param batch 是否是批量删除，如果不是批量删除则此参数是必传
     * @param single 单个删除时对象，单个删除此字段必传
     */
    delete(batch?: boolean, single?: any): void {
        if (batch && (!this.selection || this.selection.selected.length === 0)) { return; }
        const data = {
            ids: batch ? this.selection.selected.map(v => v.id) : [single.id]
        };
        const dialogRef = this.dialog.open(ConfirmComponent, {
            data: {
                message: '您确定要删除吗？',
                buttonText: {
                    ok: '删除',
                    cancel: '取消'
                }
            }
        });
        dialogRef.afterClosed().pipe(
            takeUntil(this.onDestroy)
        ).subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.configService.deleteEnv(data).pipe(
                    takeUntil(this.onDestroy)
                ).subscribe(res => {
                    if (res.result) {
                        this.mToast.show('删除成功');
                        this.getAllEnvList();
                        this.selection.clear();
                    } else {
                        const error = res.data && res.data.map(v => v['message']).filter(t => !!t).join(',');
                        this.mToast.show(error);
                    }
                });
            }
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

    // 计算所传递行中复选框的标签
    checkboxLabel(row?: EnvList): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

}
