import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { DbManage } from '../config/network.config';

@Injectable({
  providedIn: 'root'
})
export class DbManageService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 查询所有的数据库配置
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#130-%E6%9F%A5%E8%AF%A2%E6%89%80%E6%9C%89%E7%9A%84%E6%95%B0%E6%8D%AE%E5%BA%93%E9%85%8D%E7%BD%AE
   * @param params
   * @returnValue {Observable<any>}
   */
  getDatabaseConfList(params: any): Observable<any> {
    return this.get(`${DbManage.ConfList}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查询所有的sql语句
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#134-%E6%9F%A5%E8%AF%A2%E6%89%80%E6%9C%89%E7%9A%84sql%E8%AF%AD%E5%8F%A5
   * @param params
   * @returnValue {Observable<any>}
   */
  queryDatabaseSqlList(params: any): Observable<any> {
    return this.get(`${DbManage.SqlList}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 添加数据库配置
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#131-%E6%B7%BB%E5%8A%A0%E6%95%B0%E6%8D%AE%E5%BA%93%E9%85%8D%E7%BD%AE
   * @returnValue {Observable<any>}
   */
  createDbConfig(data: any): Observable<any> {
    return this.post(`${DbManage.CreateDbConfig}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新数据库配置
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#132-%E6%9B%B4%E6%96%B0%E6%95%B0%E6%8D%AE%E5%BA%93%E9%85%8D%E7%BD%AE
   * @param data
   * @returnValue {Observable<any>}
   */
  updateDbConfig(data: any): Observable<any> {
    return this.put(`${DbManage.UpdateDbConfig}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除数据库配置
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#133-%E5%88%A0%E9%99%A4%E6%95%B0%E6%8D%AE%E5%BA%93%E9%85%8D%E7%BD%AE
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteDbConfig(data: any): Observable<any> {
    return this.delete(`${DbManage.DeleteDbConfig}`, { body: data }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 添加sql语句
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#135-%E6%B7%BB%E5%8A%A0sql%E8%AF%AD%E5%8F%A5
   * @returnValue {Observable<any>}
   */
  addSql(data: any): Observable<any> {
    return this.post(`${DbManage.AddSql}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新sql语句
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#136-%E6%9B%B4%E6%96%B0sql%E8%AF%AD%E5%8F%A5
   * @param data
   * @returnValue {Observable<any>}
   */
  updateSql(data: any): Observable<any> {
    return this.put(`${DbManage.UpdateSql}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除sql语句
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#137-%E5%88%A0%E9%99%A4sql%E8%AF%AD%E5%8F%A5
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteSql(data: any): Observable<any> {
    return this.delete(`${DbManage.DeleteSql}`, { body: data }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * sql语法检查
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#1310-sql%E8%AF%AD%E6%B3%95%E6%A3%80%E6%9F%A5
   * @param params
   * @returnValue {Observable<any>}
   */
  checkSql(params: any): Observable<any> {
    return this.get(`${DbManage.CheckSql}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * sql语句执行
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#139-%E6%A0%B9%E6%8D%AEsql%E8%AF%AD%E5%8F%A5%E6%89%A7%E8%A1%8C
   * @param params
   * @returnValue {Observable<any>}
   */
  executeSql(params: any): Observable<any> {
    return this.get(`${DbManage.ExecSql}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查询sql语句并执行
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#138-%E6%A0%B9%E6%8D%AEsql%E8%AF%AD%E5%8F%A5id%E6%89%A7%E8%A1%8Csql%E8%AF%AD%E5%8F%A5
   * @param params
   * @returnValue {Observable<any>}
   */
  queryAndExecuteSql(params: any): Observable<any> {
    return this.get(`${DbManage.QuerySql}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
