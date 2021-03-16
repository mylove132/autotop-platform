import { Pipe, PipeTransform } from '@angular/core';

/**
 * 返回数组之间的差异数组
 * 用法： array | appDiff: [ARRAY]: [ARRAY]: ... : [ARRAY]
 * this.items = [1, 2, 3, 4];
 * <li *ngFor="let item of items | diff: [1, 2]"> <!-- Array: [3, 4] -->
 */
@Pipe({ name: 'appDiff' })
export class DiffPipe implements PipeTransform {
  transform(input: any[], ...args: any[]): any[];
  transform<T>(input: T, ...args: any[]): T;

  transform(input: any, ...args: any[]): any {
    if (!Array.isArray(input)) {
      return input;
    }

    // tslint:disable-next-line no-bitwise
    return args.reduce((d, c) => d.filter((e: any) => ~c.indexOf(e)), input);
  }
}
