import { Pipe, PipeTransform, Injectable } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

/**
 * 格式化日期和时间，例如：{{item | appDate: 'YYYY-MM-DD HH:mm:ss'}}
 */
@Pipe({ name: 'appDate' })
@Injectable()
export class DateFormatPipe implements PipeTransform {

    // format例子：[ 'YYYY-MM-DD HH:mm:ss' ]
    transform(date: any, format: string): any {
        if (date) {
            return moment(date).format(format);
        } else {
            return '--';
        }
    }

}
