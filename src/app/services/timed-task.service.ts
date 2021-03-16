import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { TimedTask } from '../config/network.config';

@Injectable({
  providedIn: 'root'
})
export class TimedTaskService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 根据定时任务状态获取定时任务列表
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#81-%E8%8E%B7%E5%8F%96%E6%89%80%E6%9C%89%E8%BF%90%E8%A1%8C%E4%B8%AD%E7%9A%84%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1
   * @param params
   * @returnValue {Observable<any>}
   */
  getTimedTaskListByStatus(params: any): Observable<any> {
    let url = '';
    if (Object.keys(params).length > 0) {
      url = `${TimedTask.List}?${this.objToParm(params)}`;
    } else {
      url = `${TimedTask.List}`;
    }
    return this.get(url).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 添加接口定时任务
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#86-%E6%B7%BB%E5%8A%A0%E6%8E%A5%E5%8F%A3%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1
   * @param data
   * @returnValue {Observable<any>}
   */
  createTimedTask(data: any): Observable<any> {
    return this.post(`${TimedTask.Create}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新接口定时任务
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#85-%E6%9B%B4%E6%94%B9%E6%8E%A5%E5%8F%A3%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1
   * @param data
   * @returnValue {Observable<any>}
   */
  updateTimedTask(data: any): Observable<any> {
    return this.put(`${TimedTask.Update}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 停止定时任务
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#82-%E5%81%9C%E6%AD%A2%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1
   * @param data
   * @returnValue {Observable<any>}
   */
  pauseTimedTask(data: any): Observable<any> {
    return this.post(`${TimedTask.Pause}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除定时任务
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#83-%E5%88%A0%E9%99%A4%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteTimedTask(data: any): Observable<any> {
    return this.delete(`${TimedTask.Delete}`, { body: data }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 重启定时任务
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#83-%E9%87%8D%E5%90%AF%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1
   * @param data
   * @returnValue {Observable<any>}
   */
  restartTimedTask(data: any): Observable<any> {
    return this.post(`${TimedTask.Restart}`, data).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 获取定时任务执行结果
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#88-%E8%8E%B7%E5%8F%96%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E7%BB%93%E6%9E%9C
   * @param params
   * @returnValue {Observable<any>}
   */
  queryTimedTaskResultById(params: any): Observable<any> {
    return this.get(`${TimedTask.QueryResult}/${params}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 根据定时任务ID获取定时任务运行结果列表
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#87-%E8%8E%B7%E5%8F%96%E6%89%80%E6%9C%89%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E7%BB%93%E6%9E%9C
   * @param params
   * @returnValue {Observable<any>}
   */
  getTimedTaskLogBySchedulerId(params: any): Observable<any> {
    return this.get(`${TimedTask.Log}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
