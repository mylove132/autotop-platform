import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换定时任务状态
 */
@Pipe({ name: 'appTimedTaskState' })
@Injectable()
export class TimedTaskStatePipe implements PipeTransform {
    transform(value: any): any {
        let type;
        switch (String(value)) {
            case '1':
                type = '运行中';
                break;
            case '2':
                type = '停止';
                break;
            case '3':
                type = '已删除';
                break;
            default:
                type = '--';
        }
        return type;
    }
}
