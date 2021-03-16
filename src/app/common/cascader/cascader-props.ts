import { EventEmitter, Input, Output, Directive } from '@angular/core';

export interface Option {
    name?: string;
    id: string;
    childList?: Option[];
    elDisabled?: boolean;
    active?: boolean;
}

@Directive()
export class CascaderPoprs {
    // input props
    @Input() set disabled(val: boolean) {}
    @Input() elDisabled = false;
    @Input() size: string;
    @Input() placeholder = '请选择';

    // data
    @Input() options: Option[];
    @Input() clearable = false;
    @Input() allLevels = true;
    @Input() changeOnSelect = false;

    // bind value
    @Input() model: string[];
    @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
}
