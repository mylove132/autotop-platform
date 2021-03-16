import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换操作类型
 */
@Pipe({ name: 'appOperationType' })
@Injectable()
export class OperationTypePipe implements PipeTransform {
    transform(date: any): any {
        let type;
        switch (String(date)) {
            case '1':
                type = '创建';
                break;
            case '2':
                type = '更改';
                break;
            case '3':
                type = '删除';
                break;
            case '4':
                type = 'ID运行接口';
                break;
            case '5':
                type = '运行临时接口';
                break;
            case '6':
                type = '运行场景';
                break;
            case '7':
                type = '转换请求';
                break;
            case '8':
                type = '停止定时任务';
                break;
            case '9':
                type = '重启定时任务';
                break;
            default:
                type = '未知';
        }
        return type;
    }
}
