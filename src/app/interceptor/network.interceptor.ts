import { catchError } from 'rxjs/operators';
import { Observable, of, TimeoutError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Md2Toast } from '../common/toast/toast';
import { Router } from '@angular/router';
import { HttpEvent, HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthKey } from '../config/network.config';
import { environment } from '../../environments/environment';
import { LocalDataService } from '../services/local-data.service';
import { eightDigitUUID } from '../utils/base.util';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {

  constructor(
    private _toast: Md2Toast,
    private _router: Router,
    private localDataService: LocalDataService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let addToken = true;

    for (let i = 0; i < nonTokenUrls.length; i++) {
      if (req.url.indexOf(nonTokenUrls[i]) !== -1) {
        addToken = false;
        break;
      }
    }

    let jsonReq;
    if (addToken) {
      jsonReq = req.clone({
        setHeaders: {
          'authorization': environment.production ? AuthKey.prod : AuthKey.test,
          'token': this.localDataService.getToken() ? this.localDataService.getToken() : '',
          'requestid': eightDigitUUID()
        }
      });
    } else {
      jsonReq = req.clone({
        setHeaders: {
          'authorization': environment.production ? AuthKey.prod : AuthKey.test,
          'requestid': eightDigitUUID()
        }
      });
    }

    return next.handle(jsonReq).pipe(
      catchError(resp => {
        if ((resp.error.code === 190001 || resp.status === 401 || resp.error.statusCode === 401)) {  // token失效
          this._toast.toast('认证失败，返回登陆页', 3000, () => {
            this._router.navigate(['./login']);
          });
        }
        if (resp instanceof TimeoutError) {
          this._toast.toast('请求超时，请稍后再试～');
        }
        if (resp.status === 400) { // 400错误，统一提示服务端返回的: errorMessage
          this._toast.toast(resp.error.errorMessage);
        }
        if (resp.status === 500) { // 500错误，统一提示: 系统错误
          this._toast.toast('系统错误～');
        }
        return of(resp);
      })
    );
  }
}

const nonTokenUrls = [
  'file/v1/oss/upload/publicRead', // 阿里云zip附件上传（公共读权限）
];
