import {
  Component,
  Injectable,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';


export class Toast {
  id: number;
  isVisible: boolean;
  constructor(public message: string) { }
}

@Injectable()
export class Md2ToastConfig {
  duration = 3000;
  viewContainerRef?: ViewContainerRef = null;
}

@Injectable()
export class Md2Toast {
  private index = 0;

  _overlayRef: OverlayRef;
  _toastInstance: Md2ToastComponent;

  constructor(private _overlay: Overlay, private _config: Md2ToastConfig) { }

  /**
   * toast message
   * @param toast string or object with message and other properties of toast
   */
  toast(message: string, duration?: number, callback?) {
    this.show(message, duration, callback);
  }

  /**
   * show toast
   * @param toastObj string or object with message and other properties of toast
   */
  show(message: string, duration?: number, callback?) {
    if (!message || !message.trim()) { return; }

    if (duration) { this._config.duration = duration; }

    let toast: Toast;
    toast = new Toast(message);

    if (toast) {
      if (!this._toastInstance) {
        this._createToast();
      }

      this._setToastMessage(toast, callback);
    }
  }

  /** Create the toast to display */
  private _createToast(): void {
    this._createOverlay();
    const portal = new ComponentPortal(Md2ToastComponent, this._config.viewContainerRef);
    this._toastInstance = this._overlayRef.attach(portal).instance;
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): void {
    if (!this._overlayRef) {
      const config = new OverlayConfig();
      config.positionStrategy = this._overlay.position()
        .global()
        .top('0').right('0');

      this._overlayRef = this._overlay.create(config);
    }
  }

  /** Disposes the current toast and the overlay it is attached to */
  private _disposeToast(): void {
    this._overlayRef.dispose();
    this._overlayRef = null;
    this._toastInstance = null;
  }

  /** Updates the toast message and repositions the overlay according to the new message length */
  private _setToastMessage(toast: Toast, callback?) {
    toast.id = ++this.index;
    this._toastInstance.addToast(toast);
    setTimeout(() => {
      this.clearToast(toast.id);
      if (callback) {
        callback();
      }
    }, this._config.duration);
  }

  /**
   * clear specific toast
   * @param toastId
   */
  private clearToast(toastId: number) {
    if (this._toastInstance) {
      this._toastInstance.removeToast(toastId);
      setTimeout(() => {
        if (!this._toastInstance.hasToast()) { this._disposeToast(); }
      }, 250);

    }
  }

  /**
   * clear all toasts
   */
  clearAllToasts() {
    if (this._toastInstance) {
      this._toastInstance.removeAllToasts();
      setTimeout(() => {
        if (!this._toastInstance.hasToast()) { this._disposeToast(); }
      }, 250);

    }
  }

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'md2-toast',
  templateUrl: 'toast.html',
  styleUrls: ['toast.css'],
  encapsulation: ViewEncapsulation.None,
})
export class Md2ToastComponent {
  toasts: Toast[] = [];
  maxShown = 5;

  /**
   * add toast
   * @param toast toast object with all parameters
   */
  addToast(toast: Toast) {
    setTimeout(() => {
      toast.isVisible = true;
    }, 1);
    this.toasts.push(toast);
    if (this.toasts.length > this.maxShown) {
      this.toasts[0].isVisible = false;
      setTimeout(() => {
        this.toasts.splice(0, (this.toasts.length - this.maxShown));
      }, 250);
    }
  }

  /**
   * remove toast
   * @param toastId number of toast id
   */
  removeToast(toastId: number) {
    this.toasts.forEach((t: any) => { if (t.id === toastId) { t.isVisible = false; } });
    setTimeout(() => {
      this.toasts = this.toasts.filter((toast) => {
        return toast.id !== toastId; });
    }, 250);
  }

  /**
   * remove all toasts
   * @param toastId number of toast id
   */
  removeAllToasts() {
    this.toasts.forEach((t: any) => { t.isVisible = false; });
    setTimeout(() => {
      this.toasts = [];
    }, 250);
  }

  /**
   * check has any toast
   * @return boolean
   */
  hasToast(): boolean { return this.toasts.length > 0; }

}
