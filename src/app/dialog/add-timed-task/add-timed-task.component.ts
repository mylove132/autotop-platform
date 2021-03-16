import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { caseGradeConf, timedTaskTypeConf } from '../../config/base.config';
import { LoadingService } from '../../services/loading.service';
import { RequestService } from '../../services/request.service';
import { LocalDataService } from './../../services/local-data.service';
import { TimedTaskService } from './../../services/timed-task.service';
import { PerformanceTestService } from '../../services/performance-test.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-add-timed-task',
  templateUrl: './add-timed-task.component.html',
  styleUrls: ['./add-timed-task.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTimedTaskComponent implements OnInit, OnDestroy {
  title: string; // 标题栏
  envList: any[] = []; // 部署环境
  gradeList: any[] = []; // 接口等级
  taskList: any[] = []; // 任务类型
  jmeterList: any[] = []; // Jmeter脚本列表
  form: FormGroup;
  selectedCatalog: any[] = []; // 已选择的目录树
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  public jemterSearch: FormControl = new FormControl(); // jmeter脚本检索监听器
  public jmeterSelectedOptions; // 初始化当前选中的jmeter脚本

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, data?: any },
    private dialogRef: MatDialogRef<AddTimedTaskComponent>,
    private mToast: Md2Toast,
    private fb: FormBuilder,
    private requestService: RequestService,
    private loadingService: LoadingService,
    private timedTaskService: TimedTaskService,
    private localDataService: LocalDataService,
    private performanceTestService: PerformanceTestService
  ) {
    this.title = this.data.title;
    this.form = this.fb.group({
      name: ['', Validators.required],      // 定时任务名称
      env: ['', Validators.required],       // 部署环境
      grade: ['', Validators.required],     // 接口等级
      second: ['', Validators.required],    // 秒
      minute: ['', Validators.required],    // 分
      hour: ['', Validators.required],      // 时
      day: ['', Validators.required],       // 日
      month: ['', Validators.required],     // 月
      week: ['', Validators.required],      // 周
      restart: [false],                     // 重启
      dingtalkNotice: [false],              // 钉钉消息通知
      taskType: ['', Validators.required],  // 任务类型
      jmeterIds: ['', Validators.required], // jmeter脚本ID集合(jmeter类型)
    });
  }

  ngOnInit(): void {
    this.getAllEnvList();
    this.getScriptList();
    this.initSubscribe();
    this.gradeList = caseGradeConf;
    this.taskList = timedTaskTypeConf;
    if (this.data.data) {
      this.initForm(this.data.data);
      this.selectedCatalog = this.data.data.catalogs || [];
    }
  }

  // 初始化订阅
  initSubscribe() {
    this.jemterSearch.valueChanges.pipe(
      takeUntil(this.onDestroy),
      debounceTime(400)
    ).subscribe(keyword => {
      this.getScriptList(keyword);
    });
  }

  // 初始化表单【编辑状态下】
  initForm(data: any): void {
    const cron = data.cron.split(' ');
    this.dynamicSetValidators(data.taskType); // 更新校验器
    if (data.taskType === 1) { // 接口
      this.form.patchValue({
        name: data.name,        // 定时任务名称
        env: data.env.id,       // 部署环境
        grade: data.caseGrade,  // 接口等级
        second: cron[0],        // 秒
        minute: cron[1],        // 分
        hour: cron[2],          // 时
        day: cron[3],           // 日
        month: cron[4],         // 月
        week: cron[5],          // 周
        dingtalkNotice: data.isSendMessage, // 钉钉消息通知
        taskType: data.taskType,            // 任务类型
      });
    } else if (data.taskType === 2) { // jmeter
      const jmeterIds = data.jmeters.map(v => v.id);
      this.form.patchValue({
        name: data.name,        // 定时任务名称
        second: cron[0],        // 秒
        minute: cron[1],        // 分
        hour: cron[2],          // 时
        day: cron[3],           // 日
        month: cron[4],         // 月
        week: cron[5],          // 周
        dingtalkNotice: data.isSendMessage, // 钉钉消息通知
        taskType: data.taskType,            // 任务类型
        jmeterIds: jmeterIds
      });
      this.jmeterSelectedOptions = jmeterIds;
    }
  }

  // 获取所有环境列表信息
  getAllEnvList(): void {
    this.requestService.getEvnList().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.envList = res.data;
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // 获取Jmeter脚本列表数据
  getScriptList(keyword?: string): void {
    const data = {
      limit: 9999,
      page: 1,
      name: keyword && keyword.trim()
    };
    if (!data.name) {
      delete data.name;
    }
    this.performanceTestService.queryJemeterList(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        const lists = res.data;
        this.jmeterList = lists.items || [];
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // 目录树选择事件监听
  handleTreeChipsSelectChange(event: any): void {
    if (!event) { return; }
    this.selectedCatalog = [...event];
  }

  // 任务类型选择事件监听
  handleTakTypeSelectChange(event: MatSelectChange): void {
    const value = event.value;
    this.dynamicSetValidators(value);
  }

  // 动态设置校验器
  private dynamicSetValidators(value: number) {
    if (value === 1) { // 接口
      // 清空jmeter脚本ID集合校验器
      this.form.get('jmeterIds').clearValidators();
      this.form.get('jmeterIds').updateValueAndValidity();
      // 增加环境和等级校验器
      this.form.get('env').setValidators(Validators.required);
      this.form.get('env').updateValueAndValidity();
      this.form.get('grade').setValidators(Validators.required);
      this.form.get('grade').updateValueAndValidity();
    } else if (value === 2) { // jmeter
      // 清空环境和等级校验器
      this.form.get('env').clearValidators();
      this.form.get('env').updateValueAndValidity();
      this.form.get('grade').clearValidators();
      this.form.get('grade').updateValueAndValidity();
      // 增加jmeter脚本ID集合校验器
      this.form.get('jmeterIds').setValidators(Validators.required);
      this.form.get('jmeterIds').updateValueAndValidity();
    }
  }

  // 保存
  onSubmit({ value }): void {
    if (this.form.get('taskType').value === 1 && this.selectedCatalog.length === 0) {
      this.mToast.show('请选择目录～');
      return;
    }
    // this.loadingService.show();
    let data = {
      token: this.localDataService.getToken(),
      caseGrade: this.form.get('grade').value,
      envId: this.form.get('env').value,
      name: this.form.get('name').value,
      cron: this.form.get('second').value + ' ' + this.form.get('minute').value + ' ' + this.form.get('hour').value + ' ' + this.form.get('day').value + ' ' + this.form.get('month').value + ' ' + this.form.get('week').value,
      isSendMessage: this.form.get('dingtalkNotice').value,
      catalogIds: this.selectedCatalog.map(v => v.id) || [],
      taskType: this.form.get('taskType').value,
      jmeterIds: this.form.get('jmeterIds').value
    };
    if (this.form.get('taskType').value === 1) { // 接口
      delete(data.jmeterIds);
    } else if (this.form.get('taskType').value === 2) { // jmeter
      delete(data.envId);
      delete(data.caseGrade);
      delete(data.catalogIds);
    }
    if (this.data.data) { // 编辑模式
      data = Object.assign({}, data, {
        id: this.data.data.id,
        isRestart: this.form.get('restart').value
      });
      this.timedTaskService.updateTimedTask(data).pipe(
        takeUntil(this.onDestroy)
      ).subscribe(res => {
        this.loadingService.hide();
        if (res.result) {
          this.mToast.toast('更新成功');
          this.dialogRef.close(true);
        } else {
          this.mToast.toast(res.data);
        }
      });
    } else { // 创建模式
      this.timedTaskService.createTimedTask(data).pipe(
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
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
