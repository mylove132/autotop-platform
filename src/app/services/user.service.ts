import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { User } from '../config/network.config';

@Injectable()
export class UserService extends BaseService {

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  /**
   * 登录
   * @link http://gs.blingabc.com/sideproject/automated-test-service/blob/master/API.md#51-%E7%99%BB%E5%BD%95
   * @param data
   * @returnValue {Observable<any>}
   */
  login(data: any): Observable<any> {
    return this.post(`${User.Login}`, data).pipe(
      map((res: HttpResponse<any>) => {
        return super.verifyMiddleWare(res) ? { result: true, data: res['data'] } : { result: false, data: res['data'] };
      }),
      shareReplay()
    );
  }

}
