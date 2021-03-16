import { of, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Base, SFILE_V1 } from '../config/network.config';

@Injectable()
export class BaseService {

  loading;

  // 客户端定义的错误码
  NET_ERROR = of({ code: 40001, msg: '网络异常' });

  constructor(
    protected http: HttpClient
  ) {
  }

  public post(url, params?) {
    return this.http.post(url, params).pipe(
      catchError(res => {
        return this.NET_ERROR;
      })
    );
  }
  public delete(url, params?) {
    return this.http.request('delete', url, params).pipe(
      catchError(res => {
        return this.NET_ERROR;
      })
    );
  }
  public put(url, params?) {
    return this.http.put(url, params).pipe(
      catchError(res => {
        return this.NET_ERROR;
      })
    );
  }

  public get(url) {
    return this.http.get(url).pipe(
      catchError(res => {
        return this.NET_ERROR;
      })
    );
  }

  public verifyMiddleWare(res: any): boolean {
    if (res.code === 0 || res.code === '0') {
      return true;
    } else {
      return false;
    }
  }

  public verifyMiddleWareFromOutside(res: any): boolean {
    if (res.code === 10000 || res.code === '10000') {
      return true;
    } else {
      return false;
    }
  }

  // Get通用参数地址拼接
  objToParm(obj?: any) {
    const parmArr = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        parmArr.push(`${key}=${obj[key]}`);
      }
    }
    return parmArr.join('&');
  }

  /**
   * 查询平台编码(返回平台编码)
   * @link (返回结果同)http://wiki0.blingabc.com/pages/viewpage.action?pageId=722949
   * @param data
   * @returnValue {Observable<any>}
   */
  queryPlatformList(): Observable<any> {
    return this.get(`${Base.QueryPlatform}`).pipe(
      map((res: any) => {
        return res.code === 10000 ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查询平台编码(返回平台ID和code)
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#100-%E8%8E%B7%E5%8F%96%E5%B9%B3%E5%8F%B0%E9%9B%86%E5%90%88
   * @param data
   * @returnValue {Observable<any>}
   */
  getPlatformList(): Observable<any> {
    return this.get(`${Base.GetPlatformList}`).pipe(
      map((res: any) => {
        return this.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 阿里云附件上传（公共读权限)
   * @link http://showdoc.blingabc.com/index.php?s=/2&page_id=143
   * @param data
   * @returns {Observable<any>}
   */
  uploadFile(formData: FormData): Observable<any> {
    return this.post(`${SFILE_V1}/open-api/file/v1/upload`, formData).pipe(
      map((res: HttpResponse<any>) => {
        return this.verifyMiddleWareFromOutside(res) ? { result: true, data: res['data'] } : { result: false, msg: res['msg'] };
      })
    );
  }

  /**
   * 阿里云zip附件上传（公共读权限）
   * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=724212
   * @param data
   * @returns {Observable<any>}
   */
  uploadPublicRead(data: FormData): Observable<any> {
    return this.post(`${SFILE_V1}/v1/oss/upload/publicRead_zip`, data).pipe(
      map((res: HttpResponse<any>) => {
        return this.verifyMiddleWareFromOutside(res) ? { result: true, data: res['data'] } : { result: false, msg: res['msg'] };
      })
    );
  }

}
