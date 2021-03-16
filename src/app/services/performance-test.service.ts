import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { PerformanceTest } from '../config/network.config';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PerformanceTestService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 创建压测信息
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#121-%E5%88%9B%E5%BB%BA%E5%8E%8B%E6%B5%8B%E4%BF%A1%E6%81%AF
   * @param data
   * @returnValue {Observable<any>}
   */
  createJmeter(data: any): Observable<any> {
    return this.post(`${PerformanceTest.Create}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除压测信息数据
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#1212-%E5%88%A0%E9%99%A4%E5%8E%8B%E6%B5%8B%E4%BF%A1%E6%81%AF%E6%95%B0%E6%8D%AE
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteJmeter(data: any): Observable<any> {
    return this.delete(`${PerformanceTest.Delete}`, { body: data }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新压测信息数据
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#123-%E6%9B%B4%E6%96%B0%E5%8E%8B%E6%B5%8B%E4%BF%A1%E6%81%AF%E6%95%B0%E6%8D%AE
   * @param data
   * @returnValue {Observable<any>}
   */
  updateJmeter(data: any): Observable<any> {
    return this.put(`${PerformanceTest.Update}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 运行压测脚本
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#124-%E8%BF%90%E8%A1%8C%E5%8E%8B%E6%B5%8B%E8%84%9A%E6%9C%AC
   * @param data
   * @returnValue {Observable<any>}
   */
  runJmeter(data: any): Observable<any> {
    return this.post(`${PerformanceTest.Run}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查看某个报告信息
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#125-%E6%9F%A5%E7%9C%8B%E6%9F%90%E4%B8%AA%E6%8A%A5%E5%91%8A%E4%BF%A1%E6%81%AF
   * @param params
   * @returnValue {Observable<any>}
   */
  watchSingleJmeter(params: any): Observable<any> {
    return this.get(`${PerformanceTest.Watch}?${this.objToParm(params)}`).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查看脚本执行的日志信息
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#127-%E6%9F%A5%E7%9C%8B%E8%84%9A%E6%9C%AC%E6%89%A7%E8%A1%8C%E7%9A%84%E6%97%A5%E5%BF%97%E4%BF%A1%E6%81%AF
   * @param params
   * @returnValue {Observable<any>}
   */
  watchJmeterLog(params: any): Observable<any> {
    return this.get(`${PerformanceTest.Log}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查看脚本执行的结果信息
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#127-%E6%9F%A5%E7%9C%8B%E8%84%9A%E6%9C%AC%E6%89%A7%E8%A1%8C%E7%9A%84%E6%97%A5%E5%BF%97%E4%BF%A1%E6%81%AF
   * @param params
   * @returnValue {Observable<any>}
   */
  watchMultiplyJmeter(params: any): Observable<any> {
    return this.get(`${PerformanceTest.ResultList}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查看所有上传脚本列表
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#129-%E6%9F%A5%E7%9C%8B%E6%89%80%E6%9C%89%E4%B8%8A%E4%BC%A0%E8%84%9A%E6%9C%AC%E5%88%97%E8%A1%A8
   * @param params
   * @returnValue {Observable<any>}
   */
  queryJemeterList(params: any): Observable<any> {
    return this.get(`${PerformanceTest.List}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 查看压测脚本执行结果
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#1210-%E6%9F%A5%E7%9C%8B%E6%89%80%E6%9C%89%E4%B8%8A%E4%BC%A0%E8%84%9A%E6%9C%AC%E5%88%97%E8%A1%A8
   * @param data
   * @returnValue {Observable<any>}
   */
  queryJemeterLogById(data: any): Observable<any> {
    return this.post(`${PerformanceTest.Result}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 将接口用例转化为性能测试
   * @link
   * @param data
   * @returnValue {Observable<any>}
   */
  createPerfTestByCaseId(data: any): Observable<any> {
    return this.post(`${PerformanceTest.CreateByCaseId}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 通过jmeter脚本ID获取jmeter脚本文件文本内容
   * @link
   * @param params
   * @returnValue {Observable<any>}
   */
  getJmeterFileTextByJmeterId(params: any): Observable<any> {
    return this.get(`${PerformanceTest.GetJmeterFileText}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新jmeter脚本并同步至数据库
   * @link
   * @param data
   * @returnValue {Observable<any>}
   */
  updateJmeterFileTextAndSyncDatabase(data: any): Observable<any> {
    return this.put(`${PerformanceTest.SyncJmeterFileText}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
