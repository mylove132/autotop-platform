import { Pipe, PipeTransform } from '@angular/core';

/**
 * 空数据处理
 */
@Pipe({ name: 'appEmpty' })
export class EmptyPipe implements PipeTransform {

    transform(value: any): any {
        return (value || String(value) === '0') ? value : '--';
    }

}
