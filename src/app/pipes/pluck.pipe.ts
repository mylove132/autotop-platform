import { Pipe, PipeTransform } from '@angular/core';

export function isUndefined(value: any) {
    return typeof value === 'undefined';
}

export function isNull(value: any) {
    return value === null;
}

export function extractDeepPropertyByMapKey(obj: any, map: string): any {
    const keys = map.split('.');
    const head = keys.shift();

    return keys.reduce((prop: any, key: string) => {
      return !isUndefined(prop) && !isNull(prop) && !isUndefined(prop[key]) ? prop[key] : undefined;
    }, obj[head || '']);
}

export function isObject(value: any) {
    return value !== null && typeof value === 'object';
}

/**
 * 返回数组中的属性值
 * 用法： array | appPluck: propertyName
 * 例子：
 * this.items = [
 *   {
 *     a: 1,
 *     b: {
 *       c: 4
 *     }
 *   },
 *   {
 *     a: 2,
 *     b: {
 *       c: 5
 *     }
 *   },
 *   {
 *     a: 3,
 *     b: {
 *       c: 6
 *     }
 *   },
 * ];
 * <li *ngFor="let item of items | appPluck: 'a'"> <!-- Array: [1, 2, 3] -->
 * <li *ngFor="let item of items | appPluck: 'b.c'"> <!-- Array: [4, 5, 6] -->
 */
@Pipe({ name: 'appPluck', pure: false })
export class PluckPipe implements PipeTransform {
  transform(input: any[], map: string): any[];
  transform(input: any, map: string): any;
  transform<T>(input: T, map: string): T;

  transform(input: any, map: string): any {
    if (Array.isArray(input)) {
      return input.map(e => extractDeepPropertyByMapKey(e, map));
    }

    return isObject(input) ? extractDeepPropertyByMapKey(input, map) : input;
  }
}
