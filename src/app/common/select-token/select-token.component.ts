import { startWith, switchMap } from 'rxjs/operators';
import { Component, OnInit, Provider, forwardRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Platform, Env, SlectToken, User } from './select-token.model';
import { Subject, Subscription, Observable, combineLatest, of } from 'rxjs';
import {
  NG_VALUE_ACCESSOR,
  Validator,
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  ControlValueAccessor,
  FormControl,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SelectTokenService } from './select-token.service';

// 自定义错误匹配器
class IdentityErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && !control.value;
  }
}

// 注册 value accessor
export const ADDRESS_SELECT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectTokenComponent),
  multi: true
};

// 注册 Validator
export const ADDRESS_SELECT_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => SelectTokenComponent),
  multi: true
};

@Component({
  selector: 'app-select-token',
  templateUrl: './select-token.component.html',
  styleUrls: ['./select-token.component.scss'],
  providers: [
    ADDRESS_SELECT_VALUE_ACCESSOR,
    ADDRESS_SELECT_VALIDATOR
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectTokenComponent implements OnInit, Validator, ControlValueAccessor, OnDestroy {
  isDisabled = false; // 是否禁用表单控件
  platforms: any; // 平台
  envs: any[]; // 环境
  users: any[]; // 用户
  selectToken: SlectToken = {
    platformId: '',
    envId: '',
    tokenId: ''
  };
  // 数据流
  platform = new Subject();
  env = new Subject();
  user = new Subject();
  platform$: Observable<Platform[]>;
  env$: Observable<Env[]>;
  user$: Observable<User[]>;
  addressSub: Subscription;
  errorMatcher = new IdentityErrorMatcher(); // 错误匹配器
  private propagateChange = (_: any) => {}; // 空函数体，由框架注册，我们仅需把变化 emit 回表单

  get value(): SlectToken {
    return this.selectToken;
  }

  set value(value: SlectToken) {
    if (this.selectToken !== value) {
      this.selectToken = value;
      this.propagateChange(value);
    }
  }

  constructor(
    private selectTokenService: SelectTokenService
  ) { }

  ngOnInit(): void {
    const platform$ = this.platform.asObservable().pipe(startWith(0));
    const env$ = this.env.asObservable().pipe(startWith(0));
    const user$ = this.user.asObservable().pipe(startWith(0));
    const val$ = combineLatest([platform$, env$, user$], (p, e, u) => ({ platformId: p, envId: e, tokenId: u }));
    this.addressSub = val$.subscribe((selectToken: any) => this.propagateChange(selectToken));
    this.platform$ = this.selectTokenService.getPlatformByToken();
    this.env$ = platform$.pipe(
      switchMap(p => p ? this.selectTokenService.getEnvByPlatfromId({platformCodeId: p}) : of([]))
    );
    this.user$ = combineLatest(
      platform$,
      env$,
      (p, e) => {
        if (p && e) {
          const data = {
            platformCodeId: p,
            envId: e
          };
          return this.selectTokenService.getTokenByEnvIdAndPlatfromId(data);
        } else {
          return of([]);
        }
      }).pipe(
      switchMap(user => user)
    );
  }

  // 平台变更
  onPlatformIdChange(): void {
    this.selectToken.envId = '';
    this.selectToken.tokenId = '';
    this.platform.next(this.selectToken.platformId);
  }

  // 环境变更
  onEnvChange(): void {
    this.selectToken.tokenId = '';
    this.env.next(this.selectToken.envId);
  }

  // 用户变更
  onUserChange(): void {
    this.user.next(this.selectToken.tokenId);
  }

  // 将模型中的新值写入视图或 DOM 属性中
  writeValue(obj: any): void {
    if (obj) { // 只有当合法值 (非 undefined、null、"") 写入控件时，覆盖默认值
      this.selectToken = obj;
      if (this.selectToken.platformId) {
        this.platform.next(+this.selectToken.platformId);
      }
      if (this.selectToken.envId) {
        this.env.next(+this.selectToken.envId);
      }
      if (this.selectToken.tokenId) {
        this.user.next(+this.selectToken.tokenId);
      }
    }
  }

  // 设置当控件接收到 change 事件后，调用的函数
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  // 设置当控件接收到 touched 事件后，调用的函数
  registerOnTouched(fn: any): void { }

  // 当控件状态变成 DISABLED 或从 DISABLED 状态变化成 ENABLE 状态时，会调用该函数。该函数会根据参数值，启用或禁用指定的 DOM 元素。
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // 对提供的控件执行同步验证的方法
  validate(control: AbstractControl): ValidationErrors {
    const val = control.value as SlectToken;
    if (!val) { return null; }
    if (val.platformId && val.envId && val.tokenId) { return null; }
    return { addressError: { msg: '用户Token选择/输入有误～' } };
  }

  // 注册一个回调函数以在验证器输入更改时调用
  registerOnValidatorChange?(fn: () => void): void { }

  ngOnDestroy() {
    if (this.addressSub) {
      this.addressSub.unsubscribe();
    }
  }

}

