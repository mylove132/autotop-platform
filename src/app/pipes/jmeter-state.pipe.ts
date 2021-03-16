import { Injectable, Pipe, PipeTransform } from '@angular/core';

/**
 * 转换Jmeter脚本执行结果状态
 */
@Pipe({ name: 'appJmeterState' })
@Injectable()
export class JmeterStatePipe implements PipeTransform {
    transform(value: any): any {
        let type;
        switch (String(value)) {
            case '1':
                type = '未执行';
                break;
            case '2':
                type = '执行完成';
                break;
            case '3':
                type = '执行失败';
                break;
            default:
                type = '--';
        }
        return type;
    }
}
