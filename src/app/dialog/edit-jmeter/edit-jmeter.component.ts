import { KeyValuePipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, of } from 'rxjs';
import { takeUntil, tap, switchMap } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { LoadingService } from '../../services/loading.service';
import { PerformanceTestService } from '../../services/performance-test.service';
import { strMapToObj, toBoolean } from '../../utils/base.util';

@Component({
  selector: 'app-edit-jmeter',
  templateUrl: './edit-jmeter.component.html',
  styleUrls: ['./edit-jmeter.component.scss']
})
export class EditJmeterComponent implements OnInit, OnDestroy {
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  title: string; // 标题
  form: FormGroup; // 表单
  toggleEditJmeter = false; // 是否开启编辑Jmeter配置文件
  step: number; // 展开的面板序号

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, type: string, item: any },
    public dialogRef: MatDialogRef<EditJmeterComponent>,
    private fb: FormBuilder,
    private mToast: Md2Toast,
    private keyValuePipe: KeyValuePipe,
    private loadingService: LoadingService,
    private performanceTestService: PerformanceTestService
  ) {
    this.title = this.data.title;
    this.form = this.fb.group({
      name: ['', Validators.required],
      url: ['', Validators.required],
      thread: ['', Validators.required],
      time: ['', Validators.required],
      cycle: ['', Validators.required],
      remote: [''],
      aux: this.fb.array([])
    });
    this.initForm(this.data.item);
  }

  ngOnInit(): void {
    this.getJmeterScript(this.data.item.id);
  }

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

  // 获取Jmeter脚本文本内容
  getJmeterScript(jmeterId: number): void {
    this.loadingService.show();
    const data = {
      id: jmeterId
    };
    this.performanceTestService.getJmeterFileTextByJmeterId(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        const jmxScript = this.keyValuePipe.transform(res.data) || [];
        const jmeterArray = [];
        jmxScript.forEach(element => {
          const group = this.parseQuery(element.key);
          const children = element.value;
          const member = [];
          children.forEach(child => {
            member.push(this.parseQuery(child));
          });
          const jmerterItem = Object.assign({}, {
            ThreadGroup: group,
            HTTPSamplerProxy: member
          });
          jmeterArray.push(jmerterItem);
        });
        this.initJmeterForm(jmeterArray);
      } else {
        this.loadingService.hide();
        this.mToast.show(res.data);
      }
    });
  }

  // 使用正则表达式解析特殊脚本文本
  parseQuery(url: string): Object {
    const queryObj = {};
    const reg = new RegExp(/([^\s=]+)=(['"\s]?)([^'"]+)\2(?=\s|$|>)/, 'g');
    const querys = url.match(reg);
    for (const key in querys) {
      if (querys.hasOwnProperty(key)) {
        const element = querys[key];
        const query = element.split('=');
        const mKey = query[0];
        const mValue = query[1].replace(/\"/g, '');
        queryObj[mKey] ? queryObj[mKey] = [].concat(queryObj[mKey] , mValue) : queryObj[mKey] = mValue;
      }
    }
    return queryObj;
  }

  // 初始化表单
  initJmeterForm(data: any[]): void {
    const groupFG = [];
    data.forEach(item => {
      const childrenFG = [];
      const group = item.ThreadGroup;
      const member = item.HTTPSamplerProxy;
      member.forEach(element => {
        childrenFG.push(
          this.fb.group({
            enabled: [toBoolean(element.enabled), Validators.required],
            guiclass: [element.guiclass, Validators.required],
            testclass: [element.testclass, Validators.required],
            testname: [element.testname, Validators.required]
          })
        );
      });
      const groupItem = this.fb.group({
        ThreadGroup: this.fb.group({
          enabled: [toBoolean(group.enabled), Validators.required],
          guiclass: [group.guiclass, Validators.required],
          testclass: [group.testclass, Validators.required],
          testname: [group.testname, Validators.required]
        }),
        HTTPSamplerProxy: this.fb.array(childrenFG)
      });
      groupFG.push(groupItem);
    });
    const auxFormArray = this.fb.array(groupFG);
    this.form.setControl('aux', auxFormArray);
    this.loadingService.hide();
  }

  // 保存
  onSubmit({ value }): void {
    if (this.form.get('aux').dirty) { // 检测jmeter脚本文件的表单是否修改过，如果修改过了则做同步数据库操作，否则忽略
      this.loadingService.show('正在保存数据，请稍后...', true);
      const jmeterFileText = this.transformJmeterFromForm(); // Jmeter表单数据同步脚本到数据库
      const syncData = {
        id: this.data.item.id,
        fileList: jmeterFileText
      };
      this.performanceTestService.updateJmeterFileTextAndSyncDatabase(syncData).pipe(
        tap(x => {
          if (x.result) { }
        }),
        switchMap(v => {
          if (v.result) {
            const submitData = {
              id: this.data.item.id,
              name: this.form.get('name').value,
              url: this.form.get('url').value,
              preCountNumber: this.form.get('thread').value,
              preCountTime: this.form.get('time').value,
              loopNum: this.form.get('cycle').value,
              remote_address: this.form.get('remote').value,
            };
            return this.performanceTestService.updateJmeter(submitData);
          } else {
            this.mToast.toast(v.data);
              return of();
          }
      })
      ).subscribe(res => {
        if (res.result) {
          this.loadingService.hide();
          if (res.result) {
            this.mToast.toast('保存成功');
            this.dialogRef.close(true);
          } else {
            this.mToast.toast(res.data);
          }
        }
      });
    } else {
      this.loadingService.show('正在保存数据，请稍后...');
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
          this.mToast.toast('保存成功');
          this.dialogRef.close(true);
        } else {
          this.mToast.toast(res.data);
        }
      });
    }
  }

  // 同步Jmeter脚本
  handleSync(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const jmeterFileText = this.transformJmeterFromForm(); // Jmeter表单数据同步脚本到数据库
    const syncData = {
      id: this.data.item.id,
      fileList: jmeterFileText
    };
    this.loadingService.show('正在同步数据库，请稍后...');
    this.performanceTestService.updateJmeterFileTextAndSyncDatabase(syncData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.mToast.show('同步成功');
      } else {
        this.mToast.show(res.data);
      }
      this.loadingService.hide();
    });
  }

  // 转换Jmeter表单为数据文本
  transformJmeterFromForm(): string {
    const mapEntity = new Map();
    this.form.value.aux.forEach(element => {
      const group = element.ThreadGroup;
      const childred = element.HTTPSamplerProxy;
      const key = `<ThreadGroup guiclass=\"${group.guiclass}\" testclass=\"${group.testclass}\" testname=\"${group.testname}\" enabled=\"${group.enabled}\">`;
      const value = [];
      childred.forEach(child => {
        const childItem = `<HTTPSamplerProxy guiclass=\"${child.guiclass}\" testclass=\"${child.testclass}\" testname=\"${child.testname}\" enabled=\"${child.enabled}\">`;
        value.push(childItem);
      });
      mapEntity.set(key, value);
    });
    return JSON.stringify(strMapToObj(mapEntity));
  }

  // 设置当前要打开的面板索引
  setStep(index: number): void {
    this.step = index;
  }

  // 下一个面板
  nextStep(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.step++;
  }

  // 上一个面板
  prevStep(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.step--;
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
