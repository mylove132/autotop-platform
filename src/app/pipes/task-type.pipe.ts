import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换定时任务类型
 */
@Pipe({ name: 'appTaskType' })
@Injectable()
export class TaskTypePipe implements PipeTransform {
    transform(date: any): any {
        let type;
        switch (String(date)) {
            case '1':
                type = '接口';
                break;
            case '2':
                type = 'jmeter';
                break;
            default:
                type = '未知';
        }
        return type;
    }
}
