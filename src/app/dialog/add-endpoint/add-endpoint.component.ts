import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { EnvList } from '../../modules/conference/config-manage';
import { ConfigService } from '../../services/config.service';
import { LoadingService } from '../../services/loading.service';
import { RequestService } from '../../services/request.service';

@Component({
    selector: 'app-add-endpoint',
    templateUrl: './add-endpoint.component.html',
    styleUrls: ['./add-endpoint.component.scss']
})
export class AddEndpointComponent implements OnInit, OnDestroy {
    item: any;                  // 基础信息
    name: string;               // endpoint名称
    endpoint: string;           // 前缀地址
    envs: number[] = [];        // 环境id集合
    envList: EnvList[] = [];    // 环境列表集合
    private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

    constructor(
        public dialogRef: MatDialogRef<AddEndpointComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private configService: ConfigService,
        private requestService: RequestService,
        private loadingService: LoadingService,
        private mToast: Md2Toast
    ) {
        this.item = this.data;
    }

    ngOnInit(): void {
        this.getAllEnvList();
    }

    // 获取所有环境列表信息
    getAllEnvList(): void {
        this.loadingService.show();
        this.requestService.getEvnList().pipe(
            takeUntil(this.onDestroy)
        ).subscribe(res => {
            if (res.result) {
                this.envList = res.data;
            } else {
                this.mToast.show(res.data);
            }
            this.loadingService.hide();
        });
    }

    // 复选框
    onChange(mEvent: MatCheckboxChange, item: EnvList): void {
        if (mEvent.checked) {
            this.envs.push(item.id);
        } else {
            this.envs = this.envs.filter((envId: number) => envId !== item.id);
        }
    }

    // 保存
    save(): void {
        this.loadingService.show();
        const data = {
            name: this.name && this.name.trim(),
            endpoint: this.endpoint && this.endpoint.trim(),
            envs: this.envs
        };
        this.configService.AddEndpoint(data).pipe(
            takeUntil(this.onDestroy)
        ).subscribe(res => {
            if (res.result) {
                this.mToast.show('添加成功');
                this.dialogRef.close(true);
            } else {
                const error = res.data && res.data.map(v => v['message']).filter(t => !!t).join(',');
                this.mToast.show(error);
            }
            this.loadingService.hide();
        });
    }

    // 取消
    closeModal(): void {
        this.dialogRef.close();
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

}
