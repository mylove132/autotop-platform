import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { DbManageService } from '../../services/db-manage.service';
import { LoadingService } from '../../services/loading.service';
import { DbList } from '../../modules/dbm/db-list/db-list.model';

@Component({
  selector: 'app-add-db',
  templateUrl: './add-db.component.html',
  styleUrls: ['./add-db.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDbComponent implements OnInit, OnDestroy {
  title: string; // 标题
  form: FormGroup; // 表单
  pwVisibility = false; // 密码是否可见
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, type: string, item: DbList },
    public dialogRef: MatDialogRef<AddDbComponent>,
    private fb: FormBuilder,
    private mToast: Md2Toast,
    private loadingService: LoadingService,
    private dbManageService: DbManageService
  ) {
    this.title = this.data.title;
    this.form = this.fb.group({
      name: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      host: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      port: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      username: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      password: [{ value: '', disabled: this.data.type === 'view' }, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data.type !== 'add') {
      this.initForm(this.data.item);
    }
  }

  // 初始化表单
  initForm(data: any): void {
    this.form.patchValue({
      name: data.dbName,
      host: data.dbHost,
      port: data.dbPort,
      username: data.dbUsername,
      password: data.dbPassword
    });
  }

  // 保存
  onSubmit({ value }): void {
    let observable: Observable<any>;
    const submitData = {
      dbName: this.form.get('name').value,
      dbHost: this.form.get('host').value,
      dbPort: this.form.get('port').value,
      dbUsername: this.form.get('username').value,
      dbPassword: this.form.get('password').value
    };
    if (this.data.type === 'add') {
      observable = this.dbManageService.createDbConfig(submitData);
    } else if (this.data.type === 'edit') {
      observable = this.dbManageService.updateDbConfig(Object.assign({}, submitData, {
        id: this.data.item.id
      }));
    }
    observable.pipe(
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

  // 密码可见性
  handleEye(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.pwVisibility = !this.pwVisibility;
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
