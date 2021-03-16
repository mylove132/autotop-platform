import { animate, state, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { of } from 'rxjs';
import { catchError, last, map, tap } from 'rxjs/operators';
import { FileUploadModel } from './file-upload.model';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    animations: [
        trigger('fadeInOut', [
            state('in', style({ opacity: 100 })),
            transition('* => void', [
                animate(300, style({ opacity: 0 }))
            ])
        ])
    ]
})
export class FileUploadComponent implements OnInit {
    @Input() mode = 'drag' || 'click'; // 支持模式：点击上传和拖拽上传
    @Input() text = 'Upload'; // 上传按钮的文案
    @Input() param = 'file'; // http请求中发送的形式使用的名称
    @Input() target = 'https://file.io'; // 文件上传的http地址URL
    @Input() accept = 'image/*'; // 限定文件上传类型
    @Input() multiple = true; // 是否支持批量上传，默认支持
    @Input() displayAttach = false; // 是否展示上传成功之后的文件，默认不展示
    @Output() complete = new EventEmitter<string>(); // 文件上传完成之后的回调函数

    files: Array<FileUploadModel> = [];
    attachs: Array<FileUploadModel> = [];

    constructor(
        @Optional() @Inject(DOCUMENT) private document: any,
        private http: HttpClient
    ) { }

    ngOnInit(): void { }

    // 拖拽文件上传
    onDrop(files: FileList): void {
        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          this.files.push({
            data: file,
            state: 'in',
            inProgress: false,
            progress: 0,
            canRetry: false,
            canCancel: true
          });
          this.uploadFiles();
        }
      }

    // 触发上传，获取文件，组装数组
    onClick(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
        const fileUpload = this.document.getElementById('fileUpload') as HTMLInputElement;
        fileUpload.onchange = () => {
            for (let index = 0; index < fileUpload.files.length; index++) {
                const file = fileUpload.files[index];
                this.files.push({
                    data: file,
                    state: 'in',
                    inProgress: false,
                    progress: 0,
                    canRetry: false,
                    canCancel: true
                });
            }
            this.uploadFiles();
        };
        fileUpload.click();
    }

    // 取消文件上传
    cancelFile(file: FileUploadModel): void {
        file.sub.unsubscribe();
        this.removeFileFromArray(file);
    }

    // 重新上传文件（重试）
    retryFile(file: FileUploadModel): void {
        this.uploadFile(file);
        file.canRetry = false;
    }

    // 开始上传文件
    private uploadFile(file: FileUploadModel): void {
        const fd = new FormData();
        fd.append(this.param, file.data);

        const req = new HttpRequest('POST', this.target, fd, {
            reportProgress: true
        });

        file.inProgress = true;
        file.sub = this.http.request(req).pipe(
            map(event => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        file.progress = Math.round(event.loaded * 100 / event.total);
                        break;
                    case HttpEventType.Response:
                        return event;
                }
            }),
            tap(message => { }),
            last(),
            catchError((error: HttpErrorResponse) => {
                file.inProgress = false;
                file.canRetry = true;
                return of(`${file.data.name} upload failed.`);
            })
        ).subscribe(
            (event: any) => {
                if (typeof (event) === 'object') {
                    this.removeFileFromArray(file);
                    this.attachs.push(file);
                    this.complete.emit(event.body);
                }
            }
        );
    }

    // 单个文件或者批量上传处理
    private uploadFiles(): void {
        const fileUpload = this.document.getElementById('fileUpload') as HTMLInputElement;
        fileUpload.value = '';

        this.files.forEach(file => {
            this.uploadFile(file);
        });
    }

    // 取消文件上传之后或者文件上传成功之后将文件从队列中移除
    private removeFileFromArray(file: FileUploadModel): void {
        const index = this.files.indexOf(file);
        if (index > -1) {
            this.files.splice(index, 1);
        }
    }

}
