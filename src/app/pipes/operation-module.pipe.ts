import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换操作模块
 */
@Pipe({ name: 'appOperationModule' })
@Injectable()
export class OperationModulePipe implements PipeTransform {
    transform(date: any): any {
        let type;
        switch (String(date)) {
            case '1':
                type = '接口';
                break;
            case '2':
                type = '目录';
                break;
            case '3':
                type = '环境';
                break;
            case '4':
                type = 'endpoint';
                break;
            case '5':
                type = '历史记录';
                break;
            case '6':
                type = '操作记录';
                break;
            case '7':
                type = '运行';
                break;
            case '8':
                type = '场景';
                break;
            case '9':
                type = '定时任务';
                break;
            case '10':
                type = 'token';
                break;
            default:
                type = '未知';
        }
        return type;
    }
}
