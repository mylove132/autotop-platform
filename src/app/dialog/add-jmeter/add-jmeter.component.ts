import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Md2Toast } from '../../common/toast';
import { LoadingService } from '../../services/loading.service';
import { PerformanceTestService } from '../../services/performance-test.service';
export const SFILE = environment.sfile;

@Component({
  selector: 'app-add-jmeter',
  templateUrl: './add-jmeter.component.html',
  styleUrls: ['./add-jmeter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddJmeterComponent implements OnInit, OnDestroy {
  title: string; // 标题
  form: FormGroup; // 表单
  uploadApi = `${SFILE}/open-api/file/v1/upload`; // 文件上传的地址
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, type: string, item: any },
    public dialogRef: MatDialogRef<AddJmeterComponent>,
    private fb: FormBuilder,
    private mToast: Md2Toast,
    private loadingService: LoadingService,
    private performanceTestService: PerformanceTestService
  ) {
    this.title = this.data.title;
    this.form = this.fb.group({
      name: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      url: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      thread: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      time: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      cycle: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      remote: [{ value: '', disabled: this.data.type === 'view' }]
    });
    if (data.type !== 'add') { // 如果不是创建模式，则根据列表数据反显
      this.initForm(this.data.item);
    }
  }

  ngOnInit(): void { }

  // 初始化表单
  initForm(data: any): void {
    this.form.patchValue({
      name: data.name,
      url: data.url,
      thread: data.preCountNumber,
      time: data.preCountTime,
      cycle: data.loopNum,
      remote: data.remote_address
    });
  }

  // 保存
  onSubmit({ value }): void {
    if (this.data.type === 'add') {
      this.handleAdd(value);
    } else if (this.data.type === 'edit') {
      this.handleEdit(value);
    }
  }

  // 文件上传成功之后的回调
  onFileComplete(data: any) {
    this.form.patchValue({
      name: data.data.fileName,
      url: data.data.url,
    });
  }

  // 创建模式
  handleAdd(data: any): void {
    this.loadingService.show();
    const submitData = {
      name: this.form.get('name').value,
      url: this.form.get('url').value,
      preCountNumber: this.form.get('thread').value,
      preCountTime: this.form.get('time').value,
      loopNum: this.form.get('cycle').value,
      remote_address: this.form.get('remote').value,
    };
    this.performanceTestService.createJmeter(submitData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('创建成功');
        this.dialogRef.close(true);
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 编辑模式
  handleEdit(data: any): void {
    this.loadingService.show();
    const submitData = {
      id: this.data.item.id,
      name: this.form.get('name').value,
      url: this.form.get('url').value,
      preCountNumber: this.form.get('thread').value,
      preCountTime: this.form.get('time').value,
      loopNum: this.form.get('cycle').value,
      remote_address: this.form.get('remote').value,
    };
    this.performanceTestService.updateJmeter(submitData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.dialogRef.close(true);
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}

