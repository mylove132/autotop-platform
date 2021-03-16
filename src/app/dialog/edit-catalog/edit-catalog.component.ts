import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { CatalogService } from '../../services/catalog.service';
import { LocalDataService } from './../../services/local-data.service';

@Component({
    selector: 'app-edit-catalog',
    templateUrl: './edit-catalog.component.html',
    styleUrls: ['./edit-catalog.component.scss']
})
export class EditCatalogComponent implements OnInit, OnDestroy {
    platformList: any[] = [];
    platform;
    item: any; // 基础信息
    name: string; // 目录名称
    isPub = false; // 目录是否公开
    userId: number; // 当前登录用户ID
    private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

    constructor(
        public dialogRef: MatDialogRef<EditCatalogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private catalogService: CatalogService,
        private _toast: Md2Toast,
        private localDataService: LocalDataService,
    ) {
        this.item = this.data;
        this.userId = this.localDataService.getUserId();
        if (this.item.isUpdate) {
            this.name = this.item.name;
            this.isPub = this.item.isPub;
        }
        if (this.item.platformCode) {
            this.platform = this.item.platformCode.platformCode;
        }
    }

    ngOnInit(): void {
        this.queryPlatformList();
    }

    // 钉钉消息确认并提交表单
    save(): void {
        if (!this.platform) {
            this._toast.toast('请选择平台后再提交！');
            return;
        }
        if (this.item.isUpdate) {
            const data = {
                id: this.item.id,
                isPub: this.isPub.toString(),
                name: this.name,
                platformCode: this.platform
            };
            this.catalogService.updateCatalog(data).pipe(
                takeUntil(this.onDestroy)
            ).subscribe(res => {
                if (res.result) {
                    this._toast.toast('修改成功');
                    this.dialogRef.close(this.item.id);
                } else {
                    this._toast.toast(res.data);
                }
            });
        } else {
            // 新建
            const data = {
                isPub: this.isPub.toString(),
                name: this.name,
                parentId: this.item.parentId,
                platformCode: this.platform
            };
            this.catalogService.createCatalog(data).pipe(
                takeUntil(this.onDestroy)
            ).subscribe(res => {
                if (res.result) {
                    this._toast.toast('新建成功');
                    this.dialogRef.close(res.data.id);
                } else {
                    this._toast.toast(res.data);
                }
            });
        }
    }

    closeModal(): void {
        this.dialogRef.close();
    }

    // 查询平台列表
    queryPlatformList(): void {
        this.catalogService.queryPlatformList().pipe(
            takeUntil(this.onDestroy)
        ).subscribe(res => {
            if (res.result) {
                this.platformList = Object.entries(res.data);
            }
        });
    }

    tempName(list, string): void {
        return list.filter(v => {
            let temp = false;
            if (v.organizations && v.organizations.length) {
                v.organizations = this.tempName(v.organizations, string);
                temp = v.organizations.length > 0;
            }
            if (temp) {
                return true;
            }
            if (v.phone) {
                if (v.name.indexOf(string) !== -1) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });
    }

    ngOnDestroy(): void {
        this.onDestroy.next();
        this.onDestroy.complete();
    }

}
