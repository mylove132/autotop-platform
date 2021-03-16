import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { History } from '../config/network.config';

@Injectable()
export class HistoryService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 根据模糊匹配接口路径获取历史记录
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#24-%E5%88%A0%E9%99%A4%E7%9B%AE%E5%BD%95
   * @param params
   * @returnValue {Observable<any>}
   */
  getHistoryLogListByInterfacePath(params: any): Observable<any> {
    return this.get(`${History.List}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
