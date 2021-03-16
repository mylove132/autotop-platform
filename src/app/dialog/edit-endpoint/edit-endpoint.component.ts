import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { ConfigService } from '../../services/config.service';
import { LoadingService } from '../../services/loading.service';
import { Endpoint } from './../../modules/conference/endpoint-manage/endpoint-manage.model';

@Component({
  selector: 'app-edit-endpoint',
  templateUrl: './edit-endpoint.component.html',
  styleUrls: ['./edit-endpoint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditEndpointComponent implements OnInit {
  form: FormGroup;
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Endpoint,
    private dialogRef: MatDialogRef<EditEndpointComponent>,
    private mToast: Md2Toast,
    private fb: FormBuilder,
    private configService: ConfigService,
    private loadingService: LoadingService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],     // 名称
      address: ['', Validators.required],  // 地址
    });
  }

  ngOnInit(): void {
    this.initForm(this.data);
  }

  // 初始化表单
  initForm(data: Endpoint): void {
    this.form.patchValue({
      name: this.data.name,
      address: this.data.endpoint
    });
  }

  // 保存
  onSubmit({ value }): void {
    this.loadingService.show();
    const data = {
      id: this.data.id,
      name: this.form.get('name').value && this.form.get('name').value.trim(),
      endpoint: this.form.get('address').value && this.form.get('address').value.trim()
    };
    this.configService.updateEndpoint(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.mToast.show('更新成功');
        this.dialogRef.close(true);
      } else {
        this.mToast.show(res.data);
      }
      this.loadingService.hide();
    });
  }

}
