import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Catalog } from '../config/network.config';

@Injectable()
export class CatalogService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 查询目录列表
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md
   * @param data
   * @returnValue {Observable<any>}
   */
  queryCatalogList(code): Observable<any> {
    return this.get(`${Catalog.List}?platformCode=${code}`).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 创建新的目录
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#22-%E6%B7%BB%E5%8A%A0%E7%9B%AE%E5%BD%95
   * @param data
   * @returnValue {Observable<any>}
   */
  createCatalog(data: any): Observable<any> {
    return this.post(`${Catalog.Create}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 更新目录
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#23-%E6%9B%B4%E6%96%B0%E7%9B%AE%E5%BD%95
   * @param data
   * @returnValue {Observable<any>}
   */
  updateCatalog(data: any): Observable<any> {
    return this.put(`${Catalog.Create}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 删除目录
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#24-%E5%88%A0%E9%99%A4%E7%9B%AE%E5%BD%95
   * @param data
   * @returnValue {Observable<any>}
   */
  deleteCatalog(data: any): Observable<any> {
    return this.delete(`${Catalog.Delete}`, { body: data }).pipe(
      map((res: any) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

  /**
   * 拖拽目录
   * @link
   * @param data
   * @returnValue {Observable<any>}
   */
  dragAndDropCatalog(data: any): Observable<any> {
    return this.post(`${Catalog.DragAndDrop}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
