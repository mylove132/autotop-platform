import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换Http请求方式
 */
@Pipe({ name: 'appHttpType' })
@Injectable()
export class HttpTypePipe implements PipeTransform {
    transform(date: any): any {
        let type;
        switch (String(date)) {
            case '0':
                type = 'GET';
                break;
            case '1':
                type = 'POST';
                break;
            case '2':
                type = 'DELETE';
                break;
            case '3':
                type = 'PUT';
                break;
            default:
                type = '未知';
        }
        return type;
    }
}
