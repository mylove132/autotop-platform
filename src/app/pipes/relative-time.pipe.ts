import { Pipe, PipeTransform, ɵstringify } from '@angular/core';
declare const Intl: any;

/**
 * 相对时间管道
 * 例子: {{ '2019-05-24 28:54' | appRelativeTime }}
 */
@Pipe({
    name: 'appRelativeTime',
    pure: false
})
export class RelativeTimePipe implements PipeTransform {

    // 重写PipeTransform官方日期管道的transform方法，将日期时间字符串转换为相对时间字符串
    transform(value: string): string {
        const now = new Date();
        const date = new Date(value);

        // 如果传递了无效的字符串，则返回为NaN
        if (isNaN(date.getTime())) {
            // 使用与Angular相同的错误消息样式
            throw Error(`InvalidPipeArgument: '${value}' for pipe '${ɵstringify(RelativeTimePipe)}'`);
        }
        const locale = navigator.language;
        const diffInMilliSecs = date.getTime() - now.getTime();
        const diffInSecs = Math.trunc(diffInMilliSecs / 1000);

        // 取绝对差，不管日期是过去还是将来都没关系，我们只想要差异
        const absDiffInSecs = Math.abs(diffInSecs);

        // 在`case`块周围需要括号以重新声明`formatter`变量
        switch (true) {
            case absDiffInSecs < 60: {
                const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                return formatter.format(diffInSecs, 'second');
            }

            case absDiffInSecs >= 60 && absDiffInSecs < 3600: {
                const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                const minutes = Math.trunc(diffInSecs / 60);

                return formatter.format(minutes, 'minute');
            }

            case absDiffInSecs > 3600 && absDiffInSecs < 86400: {
                const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                const hours = Math.trunc(diffInSecs / 3600);

                return formatter.format(hours, 'hour');
            }

            case absDiffInSecs >= 86400 && absDiffInSecs < 604800: {
                const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                const days = Math.trunc(diffInSecs / 86400);

                return formatter.format(days, 'day');
            }

            case absDiffInSecs >= 604800 && absDiffInSecs < 2592000: {
                const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                const weeks = Math.trunc(diffInSecs / 604800);

                return formatter.format(weeks, 'week');
            }

            case absDiffInSecs >= 2592000 && absDiffInSecs < 31536000: {
                const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                const months = Math.trunc(diffInSecs / 2592000);

                return formatter.format(months, 'month');
            }

            case absDiffInSecs >= 31536000: {
                const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
                const years = Math.trunc(diffInSecs / 31536000);

                return formatter.format(years, 'year');
            }

            default:
                return '';
        }
    }
}
