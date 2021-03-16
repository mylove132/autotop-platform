import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换请求参数类型
 */
@Pipe({ name: 'appParamType' })
@Injectable()
export class ParamTypePipe implements PipeTransform {
    transform(date: any): any {
        let type;
        switch (String(date)) {
            case '0':
                type = 'TEXT';
                break;
            case '1':
                type = 'FILE';
                break;
            default:
                type = '未知';
        }
        return type;
    }
}
