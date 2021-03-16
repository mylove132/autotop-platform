import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Md2Toast } from '../../common/toast';
import { PerformanceTestService } from '../../services/performance-test.service';
import { LoadingService } from '../../services/loading.service';
import { takeUntil, debounceTime, tap } from 'rxjs/operators';
import { RequestService } from '../../services/request.service';
import { LocalDataService } from '../../services/local-data.service';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-add-perf-test',
  templateUrl: './add-perf-test.component.html',
  styleUrls: ['./add-perf-test.component.scss']
})
export class AddPerfTestComponent implements OnInit, OnDestroy {
  title: string; // 标题
  envId: number; // 环境id
  catalogId: number; // 目录树ID【接口测试目录树携带过来的】
  fuzzyCatalogId: number; // 模糊检索选中的目录ID
  form: FormGroup; // 表单
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  envList: any[] = []; // 环境列表
  caseList: any[] = []; // case列表
  public caseSearch: FormControl = new FormControl(); // 用例检索监听器
  public caseSelectedOptions; // 初始化当前选中的用例
  public nestedSelectNodes: any[] = []; // nested-select控件基础数据
  public nestedSelectDisabled = false; // 是否禁用nested-select控件
  public nestedSelectOptions = { // nested-select控件配置项
    idField: 'id',
    displayField: 'name',
    childrenField: 'children',
    placeholder: '目录',
    multiply: false,
    branchClick: true
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, type: string, item: any },
    public dialogRef: MatDialogRef<AddPerfTestComponent>,
    private fb: FormBuilder,
    private mToast: Md2Toast,
    private requestService: RequestService,
    private loadingService: LoadingService,
    private performanceTestService: PerformanceTestService,
    private localDataService: LocalDataService,
    private catalogService: CatalogService,
  ) {
    this.title = this.data.title;
    this.form = this.fb.group({
      env: [{ value: this.data.item.envId, disabled: this.data.type === 'view' }],
      envId: [{ value: this.data.item.envId, disabled: this.data.type === 'view' }, Validators.required],
      caseIds: [{ value: this.data.item.caseIds, disabled: this.data.type === 'view' }, Validators.required],
      name: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      thread: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      time: [{ value: '', disabled: this.data.type === 'view' }, Validators.required],
      cycle: [{ value: '', disabled: this.data.type === 'view' }, Validators.required]
    });
    this.envId = this.data.item.envId;
    this.catalogId = this.data.item.catalogId;
    this.envList = this.data.item.evnList;
    this.caseSelectedOptions = this.data.item.caseIds;
    if (data.type !== 'add') { // 如果不是创建模式，则根据列表数据反显
      this.initForm(this.data.item);
    }
  }

  ngOnInit(): void {
    this.getCaseList();
    this.initSubscribe();
    this.getCatalogTree();
  }

  // 初始化订阅
  initSubscribe() {
    this.caseSearch.valueChanges.pipe(
      takeUntil(this.onDestroy),
      debounceTime(400)
    ).subscribe(keyword => {
      this.handleFuzzySearch(keyword);
    });
    this.form.get('env').valueChanges.pipe(
      takeUntil(this.onDestroy),
      debounceTime(400)
    ).subscribe(keyword => {
      this.getCaseList(keyword);
    });
  }

  // 初始化表单
  initForm(data: any): void {
    this.form.patchValue({
      envId: data.envId,
      caseIds: data.caseIds,
      name: data.name,
      thread: data.preCountNumber,
      time: data.preCountTime,
      cycle: data.loopNum
    });
  }

  // 获取case列表数据
  getCaseList(keyword?: string): void {
    const data = {
      limit: 999,
      page: 1,
      envId: this.envId, // 环境id
      // catalogId: this.catalogId, // 目录id【不传默认查询所有用例】
    };
    this.requestService.getRequestList(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        const lists = res.data;
        this.caseList = lists.items || [];
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // 获取目录树信息
  getCatalogTree(): void {
    const userInfo = this.localDataService.getUserInfo();
    const platformList = [];
    if (userInfo.roleList) {
      userInfo.roleList.forEach(v => {
        if (platformList.length > 0 && platformList.every(val => val !== v.platformCode)) {
          platformList.push(v.platformCode);
        } else if (platformList.length === 0) {
          platformList.push(v.platformCode);
        }
      });
    }
    this.catalogService.queryCatalogList(platformList.join(',')).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.nestedSelectNodes = res.data;
      }
    });
  }

  // 用例模糊搜索
  handleFuzzySearch(keyword: string): void {
    const searchParams = {
      name: (keyword && keyword.trim()) || '',
      catalogId: this.fuzzyCatalogId
    };
    if (!this.nestedSelectDisabled || !this.fuzzyCatalogId) {
      delete searchParams.catalogId;
    }
    this.requestService.getInterfaceCaseListByName(searchParams).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.caseList = res.data;
      } else {
        this.mToast.show(res.data);
      }
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

  // 目录选择回调
  handleLeafSelectedChange(event: {data: string, id: string, node: any}): void {
    console.log('外部回调🍺: ', event);
    this.fuzzyCatalogId = event.node.id;
  }

  // 创建模式
  handleAdd(data: any): void {
    this.loadingService.show();
    const submitData = {
      caseIds: this.form.get('caseIds').value,
      envId: this.form.get('envId').value,
      name: this.form.get('name').value,
      preCountNumber: this.form.get('thread').value,
      preCountTime: this.form.get('time').value,
      loopNum: this.form.get('cycle').value
    };
    this.performanceTestService.createPerfTestByCaseId(submitData).pipe(
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

  // 编辑模式【目前暂未开放，作为保留】
  handleEdit(data: any): void {
    this.loadingService.show();
    const submitData = {
      caseIds: this.form.get('caseIds').value,
      envId: this.form.get('envId').value,
      name: this.form.get('name').value,
      url: this.form.get('url').value,
      preCountNumber: this.form.get('thread').value,
      preCountTime: this.form.get('time').value,
      loopNum: this.form.get('cycle').value
    };
    this.performanceTestService.createPerfTestByCaseId(submitData).pipe(
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
