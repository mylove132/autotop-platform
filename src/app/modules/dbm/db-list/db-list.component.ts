import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take, takeUntil, tap } from 'rxjs/operators';
import { Md2Toast } from '../../../common/toast';
import { Confirm } from '../../../decorators';
import { AddDbComponent } from '../../../dialog/add-db';
import { DbManageService } from '../../../services/db-manage.service';
import { LoadingService } from '../../../services/loading.service';
import { DbList, SqlList } from './db-list.model';

@Component({
  selector: 'app-db-list',
  templateUrl: './db-list.component.html',
  styleUrls: ['./db-list.component.scss']
})
export class DbListComponent implements OnInit, OnDestroy {
  // 数据库配置
  dbList: any[] = []; // 数据库配置列表
  page = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  currentDb: DbList; // 当前选中的数据库配置
  // SQL
  displayedColumns: string[] = [
    'select', // 复选框
    'id', // ID
    'name', // 名称
    'sql', // sql
    'createDate', // 创建时间
    'updateDate', // 更新时间
    'actions', // 操作
  ];
  pageOfSql = { // 分页
    pageNumber: 0,
    size: 10,
    totalElements: 0
  };
  selection = new SelectionModel(true, []); // 选中的sql
  dataSource = new MatTableDataSource<SqlList>(); // 列表信息
  queryExecuteMessage: any; // SQL运行结果
  // 添加&编辑SQL
  form: FormGroup; // 表单
  sqlPass = false; // 默认sql语法检查没有通过
  grammarCheck = false; // 默认是没有进行sql语法检查
  errorMessage: any;
  options = { // JSON配置项
    mode: 'view',
    mainMenuBar: false,
    statusBar: false,
    navigationBar: false,
    expandAll: true
  };
  textareaFocus = false; // SQL文本域是否获取了焦点
  executeMessage: any; // SQL运行结果
  currentView = 'view'; // 当前的视图模式
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露

  constructor(
    private mToast: Md2Toast,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private dbManageService: DbManageService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      sql: ['', Validators.required]
    });
    this.form.get('sql').valueChanges.pipe(
      takeUntil(this.onDestroy),
      filter(_ => this.textareaFocus),
      filter(ret => ret && typeof(ret) === 'string'),
      distinctUntilChanged(),
      debounceTime(250),
    ).subscribe(_ => {
      this.grammarCheck = false;
      this.sqlPass = false;
    });
  }

  ngOnInit(): void {
    this.getDbConfigInfo();
  }

  // 获取数据库配置列表信息
  getDbConfigInfo(): void {
    this.loadingService.show();
    const data = {
      limit: this.page.size,
      page: this.page.pageNumber + 1
    };
    this.dbManageService.getDatabaseConfList(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        const lists = res.data;
        this.dbList = lists.items;
        this.page.totalElements = lists.totalItems;
      } else {
        this.mToast.show(res.data);
      }
      this.loadingService.hide();
    });
  }

  // 分页【数据库配置】
  changePage(mEvent: PageEvent): void {
    this.page.pageNumber = mEvent.pageIndex;
    this.page.size = mEvent.pageSize;
    this.getDbConfigInfo();
  }

  // 添加【数据库配置】
  handleAdd(): void {
    const dialogRef = this.dialog.open(AddDbComponent, {
      data: {
        title: '添加数据库配置',
        type: 'add'
      },
      maxWidth: '50%',
      disableClose: true
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getDbConfigInfo())
    ).subscribe();
  }

  // 编辑【数据库配置】
  handleEdit(row: DbList): void {
    const dialogRef = this.dialog.open(AddDbComponent, {
      data: {
        item: row,
        title: '编辑数据库配置',
        type: 'edit'
      },
      maxWidth: '50%',
      disableClose: true
    });
    dialogRef.afterClosed().pipe(
      take(1),
      filter(result => result),
      tap(_ => this.getDbConfigInfo())
    ).subscribe();
  }

  // 删除【数据库配置】
  @Confirm('您确定要删除吗？')
  handleDelete(row: DbList): void {
    this.loadingService.show();
    const data = {
      ids: [row.id]
    };
    this.dbManageService.deleteDbConfig(data).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.getDbConfigInfo();
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 查询SQL【数据库配置】
  handleQuery(row: DbList): void {
    this.currentDb = row;
    this.getSqlList();
    this.form.patchValue({
      dbId: row.id
    });
  }

  // 根据数据库ID查询所有Sql列表信息
  getSqlList(): void {
    this.loadingService.show();
    const queryData = {
      dbId: this.currentDb.id
    };
    this.dbManageService.queryDatabaseSqlList(queryData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        const lists = res.data;
        this.dataSource.data = lists.items;
        this.pageOfSql.totalElements = lists.totalItems;
      } else {
        this.mToast.show(res.data);
      }
      this.loadingService.hide();
    });
  }

  // 分页【Sql】
  changePageOfSql(mEvent: PageEvent): void {
    this.pageOfSql.pageNumber = mEvent.pageIndex;
    this.pageOfSql.size = mEvent.pageSize;
    this.getSqlList();
  }

  // 计算所选元素的数量是否与总行数匹配
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  // 如果未全部选中，则选择所有行；否则清除选择
  masterToggle(): void {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // 添加【SQL】
  handleSqlAdd(): void {
    this.currentView = 'add';
    this.sqlPass = false;
    this.grammarCheck = false;
    this.form.reset();
  }

  // 运行【SQL】
  handleSqlRun(row: SqlList): void {
    this.loadingService.show('正在执行SQL，请稍后...');
    const submitData = {
      sqlId: row.id
    };
    this.dbManageService.queryAndExecuteSql(submitData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      if (res.result) {
        this.mToast.show('操作成功');
        this.queryExecuteMessage = res.data;
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  // SQL文本域获取焦点
  handleSqlFocus() {
    this.textareaFocus = true;
  }

  // SQL文本域失去焦点
  handleSqlBlur() {
    this.textareaFocus = false;
  }

  // 编辑【SQL】
  handleSqlEdit(row: SqlList): void {
    this.currentView = 'edit';
    this.sqlPass = true;
    this.grammarCheck = true;
    this.form.patchValue({
      name: row.name,
      sql: row.sql
    });
  }

  // 批量删除【SQL】
  handleSqlBatchDelete(): void {
    const ids = this.selection.selected.map(item => item.id);
    this.handleSqlDelete(ids);
  }

  // 删除【SQL】
  @Confirm('您确定要删除吗？')
  handleSqlDelete(id: number | number[]): void {
    this.loadingService.show('正在删除，请稍后...');
    const submitData = {
      ids: ([id] as any).flat(Infinity)
    };
    this.dbManageService.deleteSql(submitData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.handleQuery(this.currentDb);
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // 保存【添加&编辑SQL】
  onSubmit({ value }): void {
    this.loadingService.show('正在保存，请稍后...');
    let observable: Observable<any>;
    const submitData = {
      dbId: this.currentDb.id,
      name: this.form.get('name').value,
      sql: this.form.get('sql').value
    };
    if ('add') {
      observable = this.dbManageService.addSql(submitData);
    } else if ('edit') {
      observable = this.dbManageService.updateSql(Object.assign({}, submitData, {
        id: 1
      }));
    }
    observable.pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.mToast.toast('操作成功');
        this.currentView = 'view';
        this.handleQuery(this.currentDb);
      } else {
        this.mToast.toast(res.data);
      }
    });
  }

  // SQL语法检查【添加&编辑SQL】
  handleSqlCheck(): void {
    this.loadingService.show('正在进行语法检查，请稍后...');
    const sqlStr = this.form.get('sql').value && this.form.get('sql').value.trim();
    const submitData = {
      sql: sqlStr
    };
    this.dbManageService.checkSql(submitData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.grammarCheck = true;
        const data = res.data.data;
        if (Object.keys(data).indexOf('ok') > -1) {
          this.sqlPass = true;
          this.errorMessage = null;
        } else {
          this.sqlPass = false;
          this.errorMessage = data;
        }
      } else {
        this.sqlPass = false;
        this.mToast.show(res.data);
      }
    });
  }

  // 执行SqlList
  handleSqlExecute(): void {
    this.loadingService.show('正在执行SQL，请稍后...');
    const sqlStr = this.form.get('sql').value && this.form.get('sql').value.trim();
    const submitData = {
      sql: sqlStr,
      dbId: this.currentDb.id
    };
    this.dbManageService.executeSql(submitData).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(res => {
      this.loadingService.hide();
      if (res.result) {
        this.executeMessage = res.data;
        this.mToast.toast('操作成功');
      } else {
        this.mToast.show(res.data);
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
