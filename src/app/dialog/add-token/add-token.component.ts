import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { EnvList } from '../../modules/conference/config-manage';
import { Token } from '../../modules/conference/token-manage/token-manage.medel';
import { LoadingService } from '../../services/loading.service';
import { TokenManageService } from '../../services/token-manage.service';

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.scss']
})
export class AddTokenComponent implements OnInit, OnDestroy {
  title: string; // 标题
  envList: any[] = []; // 环境列表
  platformList: any[] = []; // 平台列表
  form: FormGroup; // 表单
  displayedColumns = ['type', 'key', 'value'];
  dataSource = new MatTableDataSource();
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, type: string, env: EnvList[], platform: any[], item: Token },
    public dialogRef: MatDialogRef<AddTokenComponent>,
    private fb: FormBuilder,
    private mToast: Md2Toast,
    private loadingService: LoadingService,
    private tokenManageService: TokenManageService,
  ) {
    this.title = this.data.title;
    this.envList = this.data.env;
    this.platformList = this.data.platform;
    this.form = this.fb.group({
      loginname: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      env: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      platform: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      loginurl: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      body: this.fb.array([])
    });
    if (data.type !== 'add') {
      this.initForm(this.data.item);
    }
  }

  ngOnInit(): void {
    this.dataSource.data = [
      { type: '用户名', key: '', value: '' },
      { type: '密码', key: '', value: '' }
    ];
    if (this.data.type === 'add') {
      this.setBodyFormArray(this.dataSource.data);
    }
  }

  // 初始化表单
  initForm(data: Token): void {
    this.form.patchValue({
      loginname: data.username,
      env: data.env.id,
      platform: data.platformCode.id,
      loginurl: data.url
    });
    const object = JSON.parse(data.body);
    const bodyData = [];
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key];
        bodyData.push({
          key,
          value: element
        });
      }
    }
    this.setBodyFormArray(bodyData);
  }

  // 设置body控制器的FormArray
  setBodyFormArray(data: any[]): void {
    const bodyFGs = data.map(item => this.fb.group({
      key: [{ value: item.key, disabled: this.data.type === 'view' }, Validators.required],
      value: [{ value: item.value, disabled: this.data.type === 'view' }, Validators.required]
    }));
    const bodyFormArray = this.fb.array(bodyFGs);
    this.form.setControl('body', bodyFormArray);
  }

  // 保存
  onSubmit({ value }): void {
    if (this.data.type === 'add') {
      this.handleAdd(value);
    } else if (this.data.type === 'edit') {
      this.handleEdit(value);
    }
  }

  // 添加模式
  handleAdd(data: any): void {
    this.loadingService.show();
    const body = data.body;
    const bodyObject = {};
    body.forEach((item: {key: string, value: string}) => {
      bodyObject[item.key] = item.value;
    });
    const submitData = {
      username: this.form.get('loginname').value,
      platformCodeId: this.form.get('platform').value,
      url: this.form.get('loginurl').value,
      envId: this.form.get('env').value,
      body: JSON.stringify(bodyObject)
    };
    this.tokenManageService.createToken(submitData).pipe(
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

  // 编辑模式
  handleEdit(data: any): void {
    this.loadingService.show();
    const body = data.body;
    const bodyObject = {};
    body.forEach((item: {key: string, value: string}) => {
      bodyObject[item.key] = item.value;
    });
    const submitData = {
      username: this.form.get('loginname').value,
      platformCodeId: this.form.get('platform').value,
      url: this.form.get('loginurl').value,
      envId: this.form.get('env').value,
      body: JSON.stringify(bodyObject),
      id: this.data.item.id,
      token: this.data.item.token
    };
    this.tokenManageService.updateToken(submitData).pipe(
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
