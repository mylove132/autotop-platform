import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'appNestedSelect'
})
export class NestedSelectPipe implements PipeTransform {

  transform(value: any, context, ...args): any {
    if (value instanceof Function) {
      return value.apply(context, args);
    }
  }

}
