import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appAutoFixed]'
})
export class AutoFixedDirective implements OnDestroy {
    private toTop = 0; // 元素距离顶部的原始距离
    private toTopElement: any; // 吸顶元素
    private timer: any;
    @Input('appAutoFixed') selector = ''; // 吸顶元素id

    @HostListener('scroll', ['$event'])
    onScroll($event: Event) {
        if (this.er.nativeElement.scrollTop >= this.toTop) {
            this.renderer2.setStyle(this.toTopElement, 'position', 'fixed');
        } else {
            this.renderer2.setStyle(this.toTopElement, 'position', 'static');
        }
    }

    constructor(
        private er: ElementRef,
        private renderer2: Renderer2
    ) {
        this.timer = setTimeout(() => {
            this.toTopElement = this.er.nativeElement.querySelector('#' + this.selector);
            this.toTop = this.toTopElement.offsetTop;
        }, 0);
    }

    ngOnDestroy(): void {
        clearTimeout(this.timer);
    }

}
