import { Component, forwardRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CascaderPoprs, Option } from './cascader-props';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-cascader',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CascaderComponent),
        multi: true
    }],
    template: `
    <span [class]="'el-cascader ' +  (menuVisible ? 'is-opened ' : '') + (elDisabled ? 'is-disabled ' : '')
      + (size ? 'el-cascader--' + size : '')"
      (click)="clickHandle($event)"
      (mouseenter)="inputHover = true" (mouseleave)="inputHover = false">
      <ng-content select='.contentDom'></ng-content>
      <span class="el-cascader__label" *ngIf="currentLabels.length">
        <ng-container *ngIf="allLevels">
          <ng-container *ngFor="let item of currentLabels; let i = index">
            {{ item.name }}
            <span *ngIf="i < currentLabels.length - 1"> / </span>
          </ng-container>
        </ng-container>
        <ng-container *ngIf="!allLevels">
          {{ currentLabels[currentLabels.length - 1].name }}
        </ng-container>
      </span>
      <app-cascader-menu></app-cascader-menu>
    </span>
    `,
    styleUrls: ['./cascader.component.css']
})
export class CascaderComponent extends CascaderPoprs implements OnInit, OnDestroy, ControlValueAccessor {

    steps: any[] = [];
    menuVisible = false;
    inputHover = false;
    currentLabels: Option[] = [];
    globalListenFunc: Function;

    constructor(
        private renderer: Renderer2
    ) {
        super();
    }

    close(): void {
        this.menuVisible = false;
        this.globalListenFunc();
        this.globalListenFunc();
    }

    clickHandle(event: MouseEvent): void {
        event.stopPropagation();
        if (this.elDisabled) {
            return;
        }

        const element: HTMLElement = event.target as HTMLElement;
        const isSelfTrigger = ['SPAN', 'I', 'INPUT', 'DIV'].find(v => v === element.tagName);
        if (!isSelfTrigger) {
            return;
        }
        this.menuVisible = !this.menuVisible;

        if (this.menuVisible) {
            this.globalListenFunc = this.renderer.listen(
                'document', 'click', () => {
                    this.menuVisible = false;
                    this.changeLabels();
                }
            );
        } else {
            this.globalListenFunc();
            this.globalListenFunc();
        }
    }

    changeLabels(): void {
        const nextValue: Option[] = [];
        this.steps.forEach((items: Option[]) => {
            const steps: Option[] = items.filter((item: Option) => item.active);
            nextValue.push(steps[0]);
        });
        this.currentLabels = nextValue.filter(x => x);
        const next = this.currentLabels.map((item: Option) => item.id);
        this.model = next;
        this.modelChange.emit(next);
        this.controlChange(next);
    }

    clearValue(event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.currentLabels = [];
        const step1 = this.options.map((option: Option) =>
            Object.assign(option, {
                active: false,
            }));
        this.steps = [step1];
        this.menuVisible = false;
    }

    selectHandle(event: Event, step: number, index: number): any {
        event.stopPropagation();

        if (this.steps[step][index].elDisabled) {
            return;
        }
        this.steps[step] = this.steps[step].map((item: Option, i: number) =>
            Object.assign(item, { active: i === index }));
        // reset steps
        this.steps.length = step + 1;
        const next = this.steps[step][index].childList;

        // go next
        if (next && Array.isArray(next) && next.length > 0) { // remove empty array bug
            // change on select (props)
            // tslint:disable-next-line:no-unused-expression
            this.changeOnSelect && this.changeLabels();
            const nativeNext = next.map((item: Option) => Object.assign(item, { active: false }));
            return this.steps.push(nativeNext);
        }
        // last step
        this.changeLabels();
        this.menuVisible = false;
    }

    showClearIcon(): boolean {
        return !!(this.clearable && this.inputHover && this.currentLabels.length);
    }

    ngOnInit(): void {
        this.clearValue();
        if (this.model && this.model.length) {
            // tslint:disable-next-line:no-shadowed-variable
            const getLabel = (options: Option[], val: string) => {
                // tslint:disable-next-line:no-shadowed-variable
                const item: Option = options.filter((item: Option) => item.id === val)[0];
                return {
                    childList: (item && item.childList.length > 0) ? item.childList : [], val: item
                };
            };

            let options: Option[] = this.options;
            const val: Option[] = this.model.map(v => {
                // tslint:disable-next-line:no-shadowed-variable
                const { childList, val } = getLabel(options, v);
                options = childList;
                return val;
            });
            this.currentLabels = val.filter(v => !!v);
        }
    }

    ngOnDestroy(): void {
        // tslint:disable-next-line:no-unused-expression
        this.globalListenFunc && this.globalListenFunc();
    }

    writeValue(value: any): void {
        this.model = value;
    }

    registerOnChange(fn: Function): void {
        this.controlChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.controlTouch = fn;
    }

    private controlChange: Function = () => { };
    private controlTouch: Function = () => { };

}
