import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Token } from '../config/network.config';
import { BaseService } from './base.service';

@Injectable()
export class TokenManageService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 根据环境或者平台获取token列表
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#91-%E6%9F%A5%E8%AF%A2token
   * @param params
   * @returnValue {Observable<any>}
   */
  getTokenListByEnvOrPlatformCode(params: any): Observable<any> {
    return this.get(`${Token.List}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 创建单个Token
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#90-%E6%B7%BB%E5%8A%A0token
   * @param data
   * @returnValue {Observable<any>}
   */
  createToken(data: any): Observable<any> {
    return this.post(`${Token.Create}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新Token
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#92-%E6%9B%B4%E6%96%B0token
   * @param data
   * @returnValue {Observable<any>}
   */
  updateToken(data: any): Observable<any> {
    return this.put(`${Token.Update}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除Token
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#93-%E5%88%A0%E9%99%A4token
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteToken(data: any): Observable<any> {
    return this.delete(`${Token.Delete}`, {body: data}).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
