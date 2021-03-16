import { Pipe, PipeTransform } from '@angular/core';

/**
 * json字符串解析
 */
@Pipe({ name: 'appObject' })
export class ObjectPipe implements PipeTransform {

    transform(value: any): any {
        return (value || String(value) !== '{}') ? JSON.parse(value) : '';
    }

}
