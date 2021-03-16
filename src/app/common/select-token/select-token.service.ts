import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Token } from '../../config/network.config';
import { BaseService } from '../../services/base.service';

@Injectable({
    providedIn: 'root'
})
export class SelectTokenService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 获取token中所有平台（去重）
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#94-%E8%8E%B7%E5%8F%96token%E4%B8%AD%E6%89%80%E6%9C%89%E5%B9%B3%E5%8F%B0%E5%8E%BB%E9%87%8D
   * @param params
   * @returnValue {Observable<any>}
   */
  getPlatformByToken(): Observable<any> {
    return this.get(`${Token.GetPlatformByToken}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      map(res => {
        if (res.result) {
          return res.data;
        } else {
          return [];
        }
      }),
      shareReplay()
    );
  }

  /**
   * 通过平台ID获取token中所有环境（去重）
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#95-%E9%80%9A%E8%BF%87%E5%B9%B3%E5%8F%B0id%E8%8E%B7%E5%8F%96token%E4%B8%AD%E6%89%80%E6%9C%89%E7%8E%AF%E5%A2%83%E5%8E%BB%E9%87%8D
   * @param params
   * @returnValue {Observable<any>}
   */
  getEnvByPlatfromId(params: any): Observable<any> {
    return this.get(`${Token.GetEnvByPlatfromId}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      map(res => {
        if (res.result) {
          return res.data;
        } else {
          return [];
        }
      }),
      shareReplay()
    );
  }

  /**
   * 通过平台ID和环境ID获取token中所有用户和tokenID
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#96-%E9%80%9A%E8%BF%87%E5%B9%B3%E5%8F%B0id%E5%92%8C%E7%8E%AF%E5%A2%83id%E8%8E%B7%E5%8F%96token%E4%B8%AD%E6%89%80%E6%9C%89%E7%94%A8%E6%88%B7%E5%92%8Ctokenid
   * @param params
   * @returnValue {Observable<any>}
   */
  getTokenByEnvIdAndPlatfromId(params: any): Observable<any> {
    return this.get(`${Token.GetTokenByEnvIdAndPlatfromId}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      map(res => {
        if (res.result) {
          return res.data;
        } else {
          return [];
        }
      }),
      shareReplay()
    );
  }

}
