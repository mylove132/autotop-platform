import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { ClipboardService } from 'ngx-clipboard';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuzzySearchEntity } from '../../common/fuzzy-search';
import { SlectToken } from '../../common/select-token/select-token.model';
import { Md2Toast } from '../../common/toast';
import { caseGradeConf } from '../../config/base.config';
import { RequestService } from '../../services/request.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DbManageService } from '../../services/db-manage.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit, OnDestroy {
  @ViewChild('tapWrap', { static: false }) tapWrap: ElementRef;
  @ViewChild(JsonEditorComponent, { static: false }) editor: JsonEditorComponent;
  options = new JsonEditorOptions(); // 运行结果JSON-Tree配置
  responseData;
  taps = [];
  environment;  // 当前环境
  method;     // 当前方法，默认get
  currentUrl;   // 当前url
  currentRequestType = 'params';   // 当前请求体类型
  currentRequestBody = {
    Params: '',
    Headers: '',
    Body: ''
  };
  caseGradeList: any[] = []; // 用例级别
  methods = [
    { value: 0, name: 'GET' },
    { value: 1, name: 'POST' },
    { value: 2, name: 'DELETE' },
    { value: 3, name: 'PUT' },
  ];
  header = {};
  params = {};
  bodyType = '10';
  paramsTableList = [];
  headerTableList = [];
  bodyTableList = [];
  endpoint;
  evn;
  evns = [];
  endpoints = [];
  requestName = '';
  disabled = false;
  assertText = '';
  assertKey = '';
  needToken = false; // 是否需要Token
  needDingtalkNotice = false; // 是否需要启用失败钉钉通知
  needSign = false; // 是否需要签名
  needExtension = false; // 是否启用场景用例
  extensionGroup = 'useScene'; // useScene场景 useParam套用参数 useSql套用SQL
  Json = '';
  assert;
  asserts;
  assertType;
  assertTypes;
  caseGrade;
  paramType; // 参数类型: 0 text 1 file
  userToken: SlectToken; // 用户Token, 只有勾选了token之后才会使用
  fuzzySearchData: FuzzySearchEntity; // 扩展模糊检索结果（场景+参数+sql）
  fuzzyRunData: any; // 场景用例运行结果
  rightOptions = { // 场景JSON-Tree配置项
    mode: 'tree',
    mainMenuBar: true,
    statusBar: true,
    navigationBar: true,
    expandAll: true,
    history: true,
    enableTransform: false,
    onEvent: ({ field, path, value }, event: Event) => {
      if (event.type === 'click') {
        let copyText = '';
        if (this.extensionGroup === 'useScene') {
          copyText = `{{${this.fuzzySearchData.alias || ''}.${path.join('.')}}}`;
        } else if (this.extensionGroup === 'useParam') {
          copyText = `{{args${this.fuzzySearchData.id}.${path.join('.')}}}`;
        } else if (this.extensionGroup === 'useSql') {
          copyText = `{{sqlAlias${this.fuzzySearchData.id}.${path.join('.')}}}`;
        }
        this.clipboardService.copyFromContent(copyText);
        this.toast.show('信息复制成功');
      }
    }
  };
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toast: Md2Toast,
    private requestService: RequestService,
    public clipboardService: ClipboardService,
    private dbManageService: DbManageService,
    public dialogRef: MatDialogRef<RequestComponent>
  ) {
    this.options.mode = 'code';
    this.options.modes = ['code', 'text', 'tree', 'view'];
    this.options.statusBar = false;
    this.options.onChange = () => console.log(this.editor.get());
    console.log('弹窗数据: ', this.data);
  }

  ngOnInit(): void {
    this.caseGradeList = caseGradeConf;
    if (this.data.data) { // 查看
      this.method = this.data.data.type;
      this.needToken = (this.data.data.token ? true : false) || false;
      this.needDingtalkNotice = this.data.data.isFailNotice || false;
      this.needSign = this.data.data.isNeedSign || false;
      this.assertText = this.data.data.assertText;
      this.assertKey = this.data.data.assertKey;
      this.caseGrade = this.data.data.caseGrade;
      this.paramType = this.data.data.paramType;
      this.taps = [
        {
          id: this.data.data.id,
          method: this.data.data.type,
          url: this.data.data.path
        },
      ];
      if (this.data.data.token) { // 如果token存在则反显tokenId三级联动
        this.userToken = {
          platformId: +this.data.data.token.platformCode.id,
          envId: +this.data.data.token.env.id,
          tokenId: +this.data.data.token.id
        };
      }
      // tslint:disable-next-line:max-line-length
      if (this.data.data.header && JSON.stringify(this.data.data.header) !== '{}' && Object.keys(JSON.parse(this.data.data.header)).length !== 0) {
        const headers = JSON.parse(this.data.data.header);
        for (const key in headers) {
          if (headers.hasOwnProperty(key)) {
            const element = headers[key];
            if (headers[key] === 'application/x-www-form-urlencoded') {
              this.bodyType = '20';
            }
            this.headerTableList.push({
              id: this.headerTableList.length,
              fileType: 'text',
              checked: true,
              key: key,
              value: element,
              description: '',
            });
          }
        }
      } else {
        this.headerTableList = [
          {
            id: 0,
            fileType: 'text',
            checked: true,
            key: '',
            value: '',
            description: '',
          }
        ];
      }
      if (this.data.data.param && Object.keys(JSON.parse(this.data.data.param)).length !== 0) {
        if (this.data.data.type === 0) {
          const params = JSON.parse(this.data.data.param);
          for (const key in params) {
            if (params.hasOwnProperty(key)) {
              const element = params[key];
              this.paramsTableList.push({
                id: this.paramsTableList.length,
                fileType: 'text',
                checked: true,
                key: key,
                value: element,
                description: '',
              });
            }
          }
          this.bodyTableList = [
            {
              id: 0,
              fileType: 'text',
              checked: true,
              key: '',
              value: '',
              description: '',
            }
          ];
        } else {
          console.log(this.bodyType);
          if (this.bodyType === '20') {
            const params = JSON.parse(this.data.data.param);
            for (const key in params) {
              if (params.hasOwnProperty(key)) {
                const element = params[key];
                this.bodyTableList.push({
                  id: this.bodyTableList.length,
                  fileType: 'text',
                  checked: true,
                  key: key,
                  value: element,
                  description: '',
                });
              }
            }
            this.paramsTableList = [
              {
                id: 0,
                fileType: 'text',
                checked: true,
                key: '',
                value: '',
                description: '',
              }
            ];
          } else {
            this.bodyType = '40';
            this.Json = this.data.data.param;
            this.bodyTableList = [
              {
                id: 0,
                fileType: 'text',
                checked: true,
                key: '',
                value: '',
                description: '',
              }
            ];
            this.paramsTableList = [
              {
                id: 0,
                fileType: 'text',
                checked: true,
                key: '',
                value: '',
                description: '',
              }
            ];
          }
        }

      } else {
        this.paramsTableList = [
          {
            id: 0,
            fileType: 'text',
            checked: true,
            key: '',
            value: '',
            description: '',
          }
        ];
        this.bodyTableList = [
          {
            id: 0,
            fileType: 'text',
            checked: true,
            key: '',
            value: '',
            description: '',
          }
        ];
      }

      this.requestName = this.data.data.name;
      this.disabled = true;
    } else { // 创建
      this.method = this.data.addData ? this.data.addData.type : 0;
      this.needToken = this.data.addData ? this.data.addData.isNeedToken : false;
      this.taps = [
        {
          id: 0,
          method: 0,
          url: this.data.addData ? this.data.addData.path : ''
        },

      ];
      this.paramsTableList = [
        {
          id: 0,
          fileType: 'text',
          checked: true,
          key: '',
          value: '',
          description: '',
        }
      ];
      this.headerTableList = [
        {
          id: 0,
          fileType: 'text',
          checked: true,
          key: '',
          value: '',
          description: '',
        }
      ];
      this.bodyTableList = [
        {
          id: 0,
          fileType: 'text',
          checked: true,
          key: '',
          value: '',
          description: '',
        }
      ];
    }
    // this.select(this.taps[0]);    // 默认选中第一个tap
    this.requestService.getEvnList().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.evns = res.data;
        this.evn = this.data.evn ? res.data.filter(x => x.name === this.data.evn.name)[0] : res.data[0];
        this.getEndpoint(this.evn.id);
      } else {
        this.toast.show(res.data, 1800);
      }
    });
    this.requestService.getAssert().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.asserts = res.data;
        this.assert = this.data.data ? this.data.data.assertType.id : res.data[0].id;
      } else {
        this.toast.show(res.data, 1800);
      }
    });
    this.requestService.getAssertType().pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.assertTypes = res.data;
        this.assertType = this.data.data ? this.data.data.assertJudge.id : res.data[0].id;
      } else {
        this.toast.show(res.data, 1800);
      }
    });

  }

  // 根据当前运行环境ID集合获取endpoint列表
  getEndpoint(data): void {
    this.requestService.getEndpointList(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(response => {
      if (response.result) {
        this.endpoints = response.data[0].endpoints;
        // 如果是查看，则反显endpoint
        this.endpoint = this.data.data
          ? response.data[0].endpoints.filter(x => x.endpoint === this.data.data.endpoint)[0] || this.data.actualEndpoint
          : response.data[0].endpoints[0];
      } else {
        this.toast.show(response.data, 1800);
      }
    });
  }

  // 切换环境
  changeEvn(event): void {
    this.getEndpoint(event.value.id);
  }

  // 启用扩展
  extensionSlideToggleChange(event: MatSlideToggleChange): void {
    if (event.checked) {
      this.dialogRef.updateSize('80%');
    } else {
      this.dialogRef.updateSize('850px');
    }
  }

  // 用例模糊检索
  handleFuzzySelected(event: any): void {
    this.fuzzySearchData = event.data;
    if (event.mode === 'useScene') { // 场景
      const data = {
        caseIds: [event.data.id],
        envId: this.evn.id
      };
      this.requestService.operateRequest(data).pipe(
        takeUntil(this.onDestroy)
      ).subscribe(res => {
        if (res.result) {
          this.fuzzyRunData = res.data[0];
        } else {
          this.toast.show('模糊检索结果运行失败', 1800);
        }
      });
    } else if (event.mode === 'useParam') { // 套用参数
      const transformData = JSON.parse(event.data.param);
      this.fuzzyRunData = transformData;
    } else if (event.mode === 'useSql') { // 套用SQL
      // 跟进SQLID运行SQL
      this.dbManageService.queryAndExecuteSql({ sqlId: event.data.id }).pipe(
        takeUntil(this.onDestroy)
      ).subscribe(res => {
        if (res.result) {
          this.fuzzyRunData = res.data;
        } else {
          this.toast.show(res.data);
        }
      });
    }
  }

  // 添加参数
  addParams(index, type): void {
    const data = {
      id: index,
      fileType: 'text',
      checked: true,
      key: '',
      value: '',
      description: '',
    };
    if (type === 'params') {
      this.paramsTableList.push(data);
    } else if (type === 'headers') {
      this.headerTableList.push(data);
    } else {
      this.bodyTableList.push(data);
    }
  }

  // 输入框变化
  tableInputChange(index, type): void {
    const length = type === 'params' ? this.paramsTableList.length : type === 'header' ?
      this.headerTableList.length : this.bodyTableList.length;
    if (length === index) {
      const data = {
        id: index,
        fileType: 'text',
        checked: true,
        key: '',
        value: '',
        description: '',
      };
      if (type === 'params') {
        this.paramsTableList.push(data);
      } else if (type === 'headers') {
        this.headerTableList.push(data);
      } else {
        this.bodyTableList.push(data);
      }
    }
  }

  // 删除
  del(item, type): void {
    if (type === 'params') {
      if (this.paramsTableList.length === 1) {
        return;
      }
      this.paramsTableList = this.paramsTableList.filter(x => +x.id !== +item.id);
    } else if (type === 'headers') {
      if (this.headerTableList.length === 1) {
        return;
      }
      this.headerTableList = this.headerTableList.filter(x => +x.id !== +item.id);
    } else {
      if (this.bodyTableList.length === 1) {
        return;
      }
      this.bodyTableList = this.bodyTableList.filter(x => +x.id !== +item.id);
    }
  }

  // body类型
  typeChange(event): void {
    this.bodyType = event.value;
    let formDataheader = false;
    if (event.value === '20') {
      if (this.headerTableList.length === 1 && !this.headerTableList[0].key) {
        this.headerTableList = [];
        this.headerTableList.push({
          id: this.headerTableList.length,
          fileType: 'text',
          checked: true,
          key: 'Content-Type',
          value: 'application/x-www-form-urlencoded',
          description: '',
        });
      } else {
        for (let i = 0; i < this.headerTableList.length; i++) {
          if (this.headerTableList[i].key === 'Content-Type') {
            this.headerTableList[i].value = 'application/x-www-form-urlencoded';
            formDataheader = true;
          }
        }
        if (!formDataheader) {
          this.headerTableList.push({
            id: this.headerTableList.length,
            fileType: 'text',
            checked: true,
            key: 'Content-Type',
            value: 'application/x-www-form-urlencoded',
            description: '',
          });
        }
      }
    } else {
      let index = -1;
      for (let i = 0; i < this.headerTableList.length; i++) {
        if (this.headerTableList[i].key === 'Content-Type') {
          index = i;
        }
      }
      if (index !== -1) {
        this.headerTableList.splice(index, 1);
      }
    }
  }

  // 选择文件
  selectFile(id): void {
    (<HTMLInputElement>document.getElementById(id)).value = '';
    document.getElementById(id).click();
  }

  // 文件上传
  upload(event, item): void {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('file', event.target.files[0]);
      this.requestService.uploadFile(formData).pipe(
        takeUntil(this.onDestroy)
      ).subscribe(res => {
        if (res.result) {
          item.value = res.data['url'];
        } else {
          this.toast.show(res.msg, 1800);
        }
      });
    }
  }

  // 参数类型切换
  paramTypeSelectChange(mEvent: MatSelectChange): void {
    const typeStr = mEvent.value;
    typeStr === 'file' ? this.paramType = 1 : this.paramType = 0;
  }

  // 选中当前tap
  select(tap): void {
    this.taps.map(x => {
      x.selected = false;
      if (+x.id === +tap.id) {
        x.selected = true;
        return x;
      }
    });
    this.currentUrl = tap.url;
    this.method = tap.method;
  }

  // 计算tap宽度
  calcWidth(): any {
    if (!this.tapWrap) {
      return {
        'width': `0px`
      };
    }
    const totalWidth = this.tapWrap.nativeElement.offsetWidth;
    const marginWidth = (this.taps.length - 1) * 5;
    const everyWidth = (totalWidth - marginWidth) / this.taps.length;
    return {
      'width': `${everyWidth}px`
    };
  }

  // 删除tap
  remove(item): void {
    this.taps = this.taps.filter(x => +x.id !== +item.id);
    if (this.taps.length === 0) {
      this.add();
    }
    this.select(this.taps[this.taps.length - 1]);
  }

  // 添加tap
  add(): void {
    let preId;
    if (this.taps.length === 0) {
      preId = 0;
    } else {
      preId = this.taps[this.taps.length - 1].id;
    }
    const tap = {
      id: preId + 1,
      url: 'Untitled Request',
      method: 'GET'
    };
    this.taps.push(tap);
    this.select(tap);
  }

  // url输入框变化
  inputChange(): void {
    const tap = this.taps.filter(x => x.selected);
    tap[0].url = this.currentUrl;
  }

  // 方法选择器变化
  methodChange(): void {
    const tap = this.taps.filter(x => x.selected);
    tap[0].method = this.method;
  }

  // 选择请求体参数
  requestSelect(type): void {
    this.currentRequestType = type;
  }

  // 发送
  send(): void {
    let paramsData: any = {};
    const header = {};
    const params: any = {
      name: this.requestName,
      endpoint: this.endpoint.endpoint || this.data.actualEndpoint, // 如果当前endpoint不匹配则取当前切换环境下的endpoint
      path: this.taps[0].url,
      type: this.method.toString(),
      assertText: this.assertText,
      paramType: this.paramType || 0,
      isNeedSign: this.needSign
    };
    if (!this.assertText) { // 如果断言的预计结果为空则不传assertText
      delete params.assertText;
    }
    if (this.method === 0) {
      for (let i = 0; i < this.paramsTableList.length; i++) {
        if (this.paramsTableList[i].key) {
          paramsData[this.paramsTableList[i].key] = this.paramsTableList[i].value;
        }
      }
    } else {
      if (this.bodyType === '20') {
        for (let i = 0; i < this.bodyTableList.length; i++) {
          if (this.bodyTableList[i].key) {
            paramsData[this.bodyTableList[i].key] = this.bodyTableList[i].value;
          }
        }
      } else if (this.bodyType === '40') {
        paramsData = this.Json;
      }
    }
    for (let i = 0; i < this.headerTableList.length; i++) {
      if (this.headerTableList[i].key) {
        header[this.headerTableList[i].key] = this.headerTableList[i].value;
      }
    }
    if (this.needToken) { // 如果需要token, 则tokenId必传
      if (!this.userToken || !this.userToken['tokenId']) {
        this.toast.show('使用token必须选择平台环境下的对应用户～');
        return;
      }
      params['tokenId'] = this.userToken.tokenId;
    }
    params.header = JSON.stringify(header) || '{}';
    params.param = this.bodyType === '40' ? paramsData : JSON.stringify(paramsData);
    this.requestService.sendRequest(params).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.responseData = res.data;
      } else {
        this.toast.show('操作失败', 1800);
      }
    });
  }

  // 保存
  close(): void {
    // 编辑
    if (this.disabled) {
      this.handleEditMode();
    }
    // 创建
    if ((this.data.addData || this.data.catalogId) && !this.disabled) {
      this.handleCreateMode();
    }
  }

  // 处理创建模式
  handleCreateMode(): void {
    if (!this.assertKey) {
      this.toast.show('请设置断言Key', 1800);
      return;
    }
    if (!this.data.addData) {
      if (!this.requestName) {
        this.toast.show('请设置名称', 1800);
        return;
      }
      if (!this.taps[0].url) {
        this.toast.show('请设置Path', 1800);
        return;
      }
    }
    if (!this.caseGrade && this.caseGrade !== 0) {
      this.toast.show('请设置用例级别', 1800);
      return;
    }
    let paramsData: any = {};
    const header = {};
    const params: any = {
      name: this.requestName,
      endpoint: this.endpoint.endpoint,
      path: this.data.addData ? this.data.addData.path : this.taps[0].url,
      type: this.method,
      catalogId: this.data.catalogId,
      endpointId: this.endpoint.id,
      assertText: this.assertText,
      assertKey: this.assertKey,
      isFailNotice: this.needDingtalkNotice,
      isNeedSign: this.needSign,
      assertType: this.assert,
      assertJudge: this.assertType,
      paramType: this.paramType || 0,
      caseGrade: this.caseGrade
    };
    if (!this.assertText) { // 如果断言的预计结果为空则不传assertText
      delete params.assertText;
    }
    if (this.method === 0) {
      for (let i = 0; i < this.paramsTableList.length; i++) {
        if (this.paramsTableList[i].key) {
          paramsData[this.paramsTableList[i].key] = this.paramsTableList[i].value;
        }
      }
    } else {
      if (this.bodyType === '20') {
        for (let i = 0; i < this.bodyTableList.length; i++) {
          if (this.bodyTableList[i].key) {
            paramsData[this.bodyTableList[i].key] = this.bodyTableList[i].value;
          }
        }
      } else if (this.bodyType === '40') {
        paramsData = this.Json;
      }
    }
    for (let i = 0; i < this.headerTableList.length; i++) {
      if (this.headerTableList[i].key) {
        header[this.headerTableList[i].key] = this.headerTableList[i].value;
      }
    }
    if (this.needToken) { // 如果需要token, 则tokenId必传
      if (!this.userToken || !this.userToken['tokenId']) {
        this.toast.show('使用token必须选择平台环境下的对应用户～');
        return;
      }
      params['tokenId'] = this.userToken.tokenId;
    }
    params.header = JSON.stringify(header) || '{}';
    params.param = this.bodyType === '40' ? paramsData : JSON.stringify(paramsData);
    this.requestService.addRequest(params).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.toast.show('创建成功', 1800);
        this.dialogRef.close();
      } else {
        this.toast.show('操作失败', 1800);
      }
    });
  }

  // 处理编辑模式
  handleEditMode(): void {
    let paramsData: any = {};
    const header = {};
    const params: any = {
      name: this.requestName,
      endpoint: this.endpoint.endpoint,
      path: this.taps[0].url,
      type: +this.method,
      catalogId: this.data.catalogId,
      endpointId: this.endpoint.id,
      assertText: this.assertText,
      assertKey: this.assertKey,
      assertType: this.assert,
      assertJudge: this.assertType,
      isFailNotice: this.needDingtalkNotice,
      isNeedSign: this.needSign,
      caseGrade: this.caseGrade
    };
    if (!this.assertText) { // 如果断言的预计结果为空则不传assertText
      delete params.assertText;
    }
    if (this.method === 0) {
      for (let i = 0; i < this.paramsTableList.length; i++) {
        if (this.paramsTableList[i].key) {
          paramsData[this.paramsTableList[i].key] = this.paramsTableList[i].value;
        }
      }
    } else {
      if (this.bodyType === '20') {
        for (let i = 0; i < this.bodyTableList.length; i++) {
          if (this.bodyTableList[i].key) {
            paramsData[this.bodyTableList[i].key] = this.bodyTableList[i].value;
          }
        }
      } else if (this.bodyType === '40') {
        paramsData = this.Json;
      }
    }
    for (let i = 0; i < this.headerTableList.length; i++) {
      if (this.headerTableList[i].key) {
        header[this.headerTableList[i].key] = this.headerTableList[i].value;
      }
    }
    if (this.needToken) { // 如果需要token, 则tokenId必传
      if (!this.userToken || !this.userToken['tokenId']) {
        this.toast.show('使用token必须选择平台环境下的对应用户～');
        return;
      }
      params['tokenId'] = this.userToken.tokenId;
    }
    params.header = JSON.stringify(header) || '{}';
    params.param = this.bodyType === '40' ? paramsData : JSON.stringify(paramsData);
    if (this.data.data.id) {
      params.id = this.data.data.id;
    }
    this.requestService.updateRequest(params).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.toast.show('修改成功', 1800);
        this.dialogRef.close();
      } else {
        this.toast.show('操作失败', 1800);
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
