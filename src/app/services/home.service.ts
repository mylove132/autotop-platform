import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Home } from '../config/network.config';
import { BaseService } from './base.service';

@Injectable({
    providedIn: 'root'
})
export class HomeService extends BaseService implements OnDestroy {
    echartThemeSubject = new Subject<void>(); // 主要用于监听页面主题切换事件

    constructor(
        protected http: HttpClient
    ) {
        super(http);
    }

    /**
     * 查询项目所有平台接口数据
     * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#141-%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E6%89%80%E6%9C%89%E5%B9%B3%E5%8F%B0%E6%8E%A5%E5%8F%A3%E6%95%B0%E6%8D%AE
     * @param 无
     * @returnValue {Observable<any>}
     */
    getIntfAndCtlgSummary(): Observable<any> {
        return this.get(`${Home.IntfAndCtlg}`).pipe(
            map((res: HttpResponse<any>) => {
                return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
            }),
            shareReplay()
        );
    }

    /**
     * 查询项目所有接口数
     * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#140-%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E6%89%80%E6%9C%89%E6%8E%A5%E5%8F%A3%E6%95%B0
     * @param 无
     * @returnValue {Observable<any>}
     */
    getIntfSummary(): Observable<any> {
        return this.get(`${Home.Intf}`).pipe(
            map((res: HttpResponse<any>) => {
                return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
            }),
            shareReplay()
        );
    }

    /**
     * 查询接口执行次数
     * @link
     * @param 无
     * @returnValue {Observable<any>}
     */
    getIntfExecuteCount(): Observable<any> {
        return this.get(`${Home.IntfExecuteCount}`).pipe(
            map((res: HttpResponse<any>) => {
                return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
            }),
            shareReplay()
        );
    }

    /**
     * 查询接口定时任务数
     * @link
     * @param 无
     * @returnValue {Observable<any>}
     */
    getIntfTimedTaskCount(): Observable<any> {
        return this.get(`${Home.IntfTimedTaskCount}`).pipe(
            map((res: HttpResponse<any>) => {
                return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
            }),
            shareReplay()
        );
    }
    /**
     * 查询接口定时任务执行次数
     * @link
     * @param 无
     * @returnValue {Observable<any>}
     */
    getIntfTimedTaskExecuteCount(): Observable<any> {
        return this.get(`${Home.IntfTimedTaskExecuteCount}`).pipe(
            map((res: HttpResponse<any>) => {
                return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
            }),
            shareReplay()
        );
    }
    /**
     * 查询jmeter定时任务数
     * @link
     * @param 无
     * @returnValue {Observable<any>}
     */
    getJmeterTimedTaskCount(): Observable<any> {
        return this.get(`${Home.JmeterCount}`).pipe(
            map((res: HttpResponse<any>) => {
                return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
            }),
            shareReplay()
        );
    }
    /**
     * 查询jmeter定时任务执行次数
     * @link
     * @param 无
     * @returnValue {Observable<any>}
     */
    getJmeterTimedTaskExecuteCount(): Observable<any> {
        return this.get(`${Home.JmeterTaskExecuteCount}`).pipe(
            map((res: HttpResponse<any>) => {
                return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
            }),
            shareReplay()
        );
    }

    ngOnDestroy(): void {
        this.echartThemeSubject.complete();
    }

}
