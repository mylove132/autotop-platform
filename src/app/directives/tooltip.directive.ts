import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { TooltipComponent } from '../dialog/tooltip';

/**
 * 全局Tooltip控件，开箱即用。
 *
 * 1. 字符串
 * <mat-icon appTooltip="Hello World!">help</mat-icon>
 *
 * 2. 自定义Html外部Template模版
 * <mat-icon [appTooltip]="templateAlias" contentType="template">help</mat-icon>
 * <ng-template #templateAlias>
 *   <!-- 你的Html代码 -->
 * </ng-template>
 *
 * 3. 自定义行内Html模版
 * <mat-icon appTooltip="<p>Hello i'm a <strong>bold</strong> text !</p>">help</mat-icon>
 *
 */
@Directive({ selector: '[appTooltip]' })
export class TooltipDirective implements OnInit, OnDestroy {
    @Input('appTooltip') text = '';
    @Input() contentType: string;
    @Input() theme: string;
    private overlayRef: OverlayRef;
    private isDisplay = true;
    private timerSubs: Subscription;
    private tooltipRef: ComponentRef<TooltipComponent>;

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private overlayPositionBuilder: OverlayPositionBuilder
    ) { }

    ngOnInit(): void {
        const positionStrategy = this.overlayPositionBuilder
            .flexibleConnectedTo(this.elementRef)
            .withPositions([{
                originX: 'center',
                originY: 'top',
                overlayX: 'center',
                overlayY: 'bottom',
                offsetY: -8,
            }]);

        this.overlayRef = this.overlay.create({ positionStrategy });
    }

    @HostListener('mouseenter')
    show(): void {
        this.tooltipRef = this.overlayRef.attach(new ComponentPortal(TooltipComponent));
        (this.tooltipRef.instance as TooltipComponent).value = this.text;
        (this.tooltipRef.instance as TooltipComponent).contentType = this.contentType;
        (this.tooltipRef.instance as TooltipComponent).theme = this.theme;
        (this.tooltipRef.instance as TooltipComponent).leave.subscribe(e => {
            this.isDisplay = e;
            if (e && this.overlayRef.hasAttached()) {
                this.overlayRef.detach();
            }
        });
    }

    @HostListener('mouseout')
    hide(): void {
        this.timerSubs = timer(300).subscribe(_ => {
            if (this.isDisplay && this.overlayRef.hasAttached()) {
                this.overlayRef.detach();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
        if (this.timerSubs) {
            this.timerSubs.unsubscribe();
        }
    }
}
