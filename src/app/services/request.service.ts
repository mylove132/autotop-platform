import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Evn, Request } from '../config/network.config';
import { BaseService } from './base.service';

@Injectable()
export class RequestService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 查询接口用例列表
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#25-%E6%9F%A5%E8%AF%A2%E6%8E%A5%E5%8F%A3%E7%94%A8%E4%BE%8B
   * @param params
   * @returnValue {Observable<any>}
   */
  getRequestList(params: any): Observable<any> {
    return this.get(`${Request.getList}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 获取运行环境
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#35-%E8%8E%B7%E5%8F%96%E6%89%80%E6%9C%89%E7%8E%AF%E5%A2%83
   * @param 无
   * @returnValue {Observable<any>}
   */
  getEvnList(): Observable<any> {
    return this.get(`${Evn.getEvn}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 获取endpoint
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#32-%E8%8E%B7%E5%8F%96%E7%8E%AF%E5%A2%83%E5%92%8Cendpoint
   * @param data
   * @returnValue {Observable<any>}
   */
  getEndpointList(data: any): Observable<any> {
    return this.get(`${Evn.getEndpointList}?envIds=${data}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 添加接口用例
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#28-%E6%B7%BB%E5%8A%A0%E6%8E%A5%E5%8F%A3%E7%94%A8%E4%BE%8B
   * @param data
   * @returnValue {Observable<any>}
   */
  addRequest(data: any): Observable<any> {
    return this.post(`${Request.addRequest}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除接口用例
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#27-%E5%88%A0%E9%99%A4%E6%8E%A5%E5%8F%A3%E7%94%A8%E4%BE%8B
   * @param data
   * @returnValue {Observable<any>}
   */
  delRequest(data: any): Observable<any> {
    return this.http.delete(`${Request.delRequest}`, {
      // @ts-ignore
      body: { ids: [data] }
    }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 执行接口用例
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#28-%E6%89%A7%E8%A1%8C%E6%8E%A5%E5%8F%A3%E7%94%A8%E4%BE%8B
   * @param data
   * @returnValue {Observable<any>}
   */
  sendRequest(data: any): Observable<any> {
    return this.http.post(`${Request.sendRequest}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新接口用例
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#26-%E6%9B%B4%E6%96%B0%E6%8E%A5%E5%8F%A3%E7%94%A8%E4%BE%8B
   * @param data
   * @returnValue {Observable<any>}
   */
  updateRequest(data: any): Observable<any> {
    return this.http.put(`${Request.addRequest}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['errorMessage'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新接口用例【批量】
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#261-%E6%89%B9%E9%87%8F%E6%9B%B4%E6%96%B0%E6%8E%A5%E5%8F%A3%E7%9B%AE%E5%BD%95
   * @param data
   * @returnValue {Observable<any>}
   */
  batchUpdateRequest(data: any): Observable<any> {
    return this.http.put(`${Request.BatchUpdate}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['errorMessage'] };
      }),
      shareReplay()
    );
  }

  /**
   * 通过用例Id执行接口用例
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#29-%E9%80%9A%E8%BF%87%E7%94%A8%E4%BE%8Bid%E6%89%A7%E8%A1%8C%E6%8E%A5%E5%8F%A3%E7%94%A8%E4%BE%8B
   * @param data
   * @returnValue {Observable<any>}
   */
  operateRequest(data: any): Observable<any> {
    return this.http.post(`${Request.operateRequest}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 获取断言类型
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#281-%E8%8E%B7%E5%8F%96%E6%96%AD%E8%A8%80%E7%B1%BB%E5%9E%8B
   * @param 无
   * @returnValue {Observable<any>}
   */
  getAssert(): Observable<any> {
    return this.http.get(`${Request.getAssert}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 获取断言关系
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#282-%E8%8E%B7%E5%8F%96%E6%96%AD%E8%A8%80%E5%85%B3%E7%B3%BB
   * @param 无
   * @returnValue {Observable<any>}
   */
  getAssertType(): Observable<any> {
    return this.http.get(`${Request.getAssertType}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['msg'] };
      }),
      shareReplay()
    );
  }

  /**
   * 根据接口名称模糊检索接口用例
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/lzh/API.md#285-%E6%90%9C%E7%B4%A2%E6%8E%A5%E5%8F%A3%E7%94%A8%E4%BE%8B
   * @param params
   * @returnValue {Observable<any>}
   */
  getInterfaceCaseListByName(params: any): Observable<any> {
    return this.get(`${Request.GetCaseList}?${this.objToParm(params)}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}


