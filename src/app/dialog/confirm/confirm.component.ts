import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * 全局确认Confirm控件，开箱即用
 * 使用方法：
 * private dialog: MatDialog
 * const dialogRef = this.dialog.open(ConfirmationDialog, {
 *     data:{
 *       message: 'Are you sure want to delete?',
 *       buttonText: {
 *         ok: 'Save',
 *         cancel: 'No'
 *       }
 *     }
 * });
 * dialogRef.afterClosed().subscribe((confirmed: boolean) => {
 *     if (confirmed) {
 *         // you have to do
 *     }
 * });
 */
@Component({
    selector: 'app-confirm',
    template: `
        <mat-dialog-content>
            <p>{{message}}</p>
        </mat-dialog-content>
        <mat-dialog-actions align="center">
            <button mat-raised-button color="primary" (click)="onConfirmClick()" tabindex="1">{{confirmButtonText}}</button>
            <button mat-raised-button mat-dialog-close tabindex="-1">{{cancelButtonText}}</button>
        </mat-dialog-actions>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {
    message = 'Are you sure?';  // 提示文本
    confirmButtonText = 'Yes';          // 确认按钮
    cancelButtonText = 'Cancel';        // 取消按钮

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<ConfirmComponent>
    ) {
        if (this.data) {
            this.message = data.message || this.message;
            if (data.buttonText) {
                this.confirmButtonText = data.buttonText.ok || this.confirmButtonText;
                this.cancelButtonText = data.buttonText.cancel || this.cancelButtonText;
            }
        }
    }

    onConfirmClick(): void {
        this.dialogRef.close(true);
    }

}
