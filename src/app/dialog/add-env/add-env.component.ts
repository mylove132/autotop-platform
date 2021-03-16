import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { ConfigService } from '../../services/config.service';
import { LoadingService } from '../../services/loading.service';

@Component({
    selector: 'app-add-env',
    templateUrl: './add-env.component.html',
    styleUrls: ['./add-env.component.scss']
})
export class AddEnvComponent implements OnInit, OnDestroy {
    item: any; // 基础信息
    name: string; // 环境名称
    private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

    constructor(
        public dialogRef: MatDialogRef<AddEnvComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private configService: ConfigService,
        private loadingService: LoadingService,
        private mToast: Md2Toast
    ) {
        this.item = this.data;
    }

    ngOnInit(): void { }

    // 保存
    save(): void {
        this.loadingService.show();
        const data = {
            name: this.name
        };
        this.configService.AddEnv(data).pipe(
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
