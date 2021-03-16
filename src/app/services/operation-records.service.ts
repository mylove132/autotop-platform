import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { OperationRecords } from '../config/network.config';
import { BaseService } from './base.service';

@Injectable()
export class OperationRecordsService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 获取操作记录列表
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#110-%E8%8E%B7%E5%8F%96%E6%93%8D%E4%BD%9C%E8%AE%B0%E5%BD%95%E5%88%97%E8%A1%A8
   * @param params
   * @returnValue {Observable<any>}
   */
  getOperationRecordsByContidion(params: any): Observable<any> {
    return this.get(`${OperationRecords.List}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 获取所有用户列表
   * @link
   * @param 无
   * @returnValue {Observable<any>}
   */
  queryAllUsers(): Observable<any> {
    return this.get(`${OperationRecords.UserList}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
