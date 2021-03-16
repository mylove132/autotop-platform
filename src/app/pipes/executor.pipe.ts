import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换接口执行者
 */
@Pipe({ name: 'appExecutor' })
@Injectable()
export class ExecutorPipe implements PipeTransform {
    transform(date: any): any {
        let type;
        switch (String(date)) {
            case '0':
                type = '手动执行';
                break;
            case '1':
                type = '定时任务执行';
                break;
            default:
                type = '未知';
        }
        return type;
    }
}
