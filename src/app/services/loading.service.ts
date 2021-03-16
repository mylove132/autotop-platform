import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { MatSpinner } from '@angular/material/progress-spinner';
import { of, Subject } from 'rxjs';
import { delay, map, scan, take } from 'rxjs/operators';
import { CocoComponent } from '../common/coco/coco.component';
import { LOADING_CONTAINER_DATA } from '../config/injection-token';

/**
 * 全局loading控件，开箱即用。
 * 使用方法：
 * 可选参数：message
 * 在构造方法中引入：private loadingService: LoadingService
 * 创建loading：this.loadingService.show()
 * 销毁loading：this.loadingService.hide()
 */
@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private spinnerTopRef = this.cdkSpinnerCreate();
    private spin$: Subject<boolean> = new Subject();
    private message: string; // loading文案
    private async: boolean; // 是否是异步操作，保留loading状态

    constructor(
        private overlay: Overlay,
        private injector: Injector
    ) {

        this.spin$
            .asObservable()
            .pipe(
                map(val => val ? 1 : -1),
                scan((acc, one) => (acc + one) >= 0 ? acc + one : 0, 0)
            )
            .subscribe(
                (res) => {
                    if (res === 1) {
                        this.showSpinner();
                    } else if (res === 0) {
                        // tslint:disable-next-line:no-unused-expression
                        this.spinnerTopRef.hasAttached() ? this.stopSpinner() : null;
                    }
                }
            );
    }

    private cdkSpinnerCreate() {
        return this.overlay.create({
            hasBackdrop: true,
            backdropClass: 'dark-backdrop',
            positionStrategy: this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically()
        });
    }

    private showSpinner() {
        // this.spinnerTopRef.attach(new ComponentPortal(MatSpinner)); // 默认加载
        const componentPortal = new ComponentPortal(
            CocoComponent,
            null,
            this.createInjector({message: this.message})
        );
        this.spinnerTopRef.attach(componentPortal); // coco加载
        if (!this.async) {
            of(true).pipe(
                take(1),
                delay(3000),
            ).subscribe(_ => {
                if (this.spinnerTopRef.hasAttached()) {
                    this.spin$.next(false);
                }
            });
        }
    }

    private stopSpinner() {
        this.spinnerTopRef.detach();
    }

    // 创建自定义注入器
    createInjector(dataToPass): PortalInjector {
        const injectorTokens = new WeakMap();
        injectorTokens.set(LOADING_CONTAINER_DATA, dataToPass);
        return new PortalInjector(this.injector, injectorTokens);
    }

    /**
     * 创建loading加载器
     */
    show(message?: string, async?: boolean) {
        this.message = message;
        this.async = async;
        this.spin$.next(true);
    }

    /**
     * 销毁loading加载器
     */
    hide() {
        this.spin$.next(false);
    }

}
