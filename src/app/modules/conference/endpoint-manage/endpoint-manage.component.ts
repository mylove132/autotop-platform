import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { empty, of, Subject } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { EditEndpointComponent } from '../../../dialog/edit-endpoint';
import { Md2Toast } from '../../../common/toast';
import { AddEndpointComponent } from '../../../dialog/add-endpoint';
import { ConfirmComponent } from '../../../dialog/confirm';
import { ConfigService } from '../../../services/config.service';
import { LoadingService } from '../../../services/loading.service';
import { RequestService } from '../../../services/request.service';
import { EnvList } from '../config-manage';
import { Endpoint, EndpointList } from './endpoint-manage.model';

@Component({
    selector: 'app-endpoint-manage',
    templateUrl: './endpoint-manage.component.html',
    styleUrls: ['./endpoint-manage.component.scss']
})
export class EndpointManageComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['select', 'serial', 'id', 'name', 'endpoint'];
    dataSource: any[] = []; // 表格列表信息
    selection = new SelectionModel<Endpoint>(true, []); // 选中的环境
    envList: EnvList[] = []; // 可展开面板列表信息
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
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
    }

    // 获取所有Endpoint列表信息
    getAllEnvList(): void {
        this.loadingService.show();
        let envIds = [];
        this.requestService.getEvnList().pipe(
            takeUntil(this.onDestroy),
            tap(x => {
                if (x.result) {
                    envIds = x.data.map(v => v.id);
                } else {
                    this.loadingService.hide();
                }
            }),
            switchMap(x => x.result ? this.requestService.getEndpointList(envIds.join(',')) : of()),
            catchError(_ => {
                this.loadingService.hide();
                return empty();
            })
        ).subscribe(res => {
            if (res.result) {
                this.envList = res.data;
                const info = res.data;
                const temp = [];
                info.forEach((item: EndpointList) => {
                    const source = new MatTableDataSource<Endpoint>();
                    source.data = item.endpoints;
                    source.paginator = this.paginator;
                    temp.push(source);
                });
                this.dataSource = temp;
            }
            this.loadingService.hide();
        });
    }

    // 添加
    add(): void {
        const dialogOptions = {
            width: '80%',
            maxWidth: '600px',
            data: '',
            disableClose: true
        };
        const dialogRef = this.dialog.open(AddEndpointComponent, dialogOptions);
        dialogRef.afterClosed().pipe(
            takeUntil(this.onDestroy)
        ).subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.getAllEnvList();
            }
        });
    }

    // 修改
    handleEdit(row: Endpoint): void {
        const dialogRef = this.dialog.open(EditEndpointComponent, {
            data: row,
            maxWidth: '500px'
        });
        dialogRef.afterClosed().pipe(
            take(1),
            tap(v => console.log('===', v)),
            filter(result => result),
            tap(v => console.log('=((()))=', v)),
            tap(_ => this.getAllEnvList())
        ).subscribe();
    }

    /**
     * 删除（含批量删除）
     * @param batch 是否是批量删除，如果不是批量删除则此参数是必传
     * @param single 单个删除时对象，单个删除此字段必传
     */
    delete(batch?: boolean, single?: any): void {
        if (batch && (!this.selection || this.selection.selected.length === 0)) { return; }
        const submitData = {
            endpointIds: batch ? this.selection.selected.map(v => v.id) : [single.id]
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
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.configService.deleteEndpoint(submitData).pipe(
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
    isAllSelected(index: number): boolean {
        const input = (this.dataSource[index] as any).data.map(t => t.id);
        const args = this.selection.selected.map(v => v.id);
        const newArr = [];
        for (let i = 0; i < input.length; i++) {
            for (let j = 0; j < args.length; j++) {
                if (args[j] === input[i]) {
                    newArr.push(args[j]);
                }
            }
        }
        const numSelected = newArr.length;
        const numRows = (this.dataSource[index] as any).data.length;
        return numSelected === numRows;
    }

    // 如果未全部选中，则选择所有行；否则清除选择
    masterToggle(index: number): void {
        this.isAllSelected(index)
            ? this.selection.deselect(...(this.dataSource[index] as any).data)
            : (this.dataSource[index] as any).data.forEach(row => this.selection.select(row));
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

}
