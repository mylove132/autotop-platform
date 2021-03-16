import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Evn } from '../config/network.config';
import { BaseService } from './base.service';

/**
 * 配置相关的服务
 */
@Injectable()
export class ConfigService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 添加环境
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#30-%E6%B7%BB%E5%8A%A0%E7%8E%AF%E5%A2%83
   * @param data
   * @returnValue {Observable<any>}
   */
  AddEnv(data: any): Observable<any> {
    return this.post(`${Evn.addEnv}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除环境
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#33-%E5%88%A0%E9%99%A4%E7%8E%AF%E5%A2%83
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteEnv(data: any): Observable<any> {
    return this.delete(`${Evn.deleteEnv}`, { body: data }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除Endpoint
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#34-%E5%88%A0%E9%99%A4endpoint
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteEndpoint(data: any): Observable<any> {
    return this.delete(`${Evn.deleteEndpoint}`, { body: data }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 添加Endpoint
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#31-%E6%B7%BB%E5%8A%A0endpoint
   * @param data
   * @returnValue {Observable<any>}
   */
  AddEndpoint(data: any): Observable<any> {
    return this.post(`${Evn.addEndpoint}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 修改Endpoint
   * @link
   * @param data
   * @returnValue {Observable<any>}
   */
  updateEndpoint(data: any): Observable<any> {
    return this.put(`${Evn.addEndpoint}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }


}
