import { ConfirmComponent } from '../../dialog/confirm';

/**
 * 例子：
 * @Confirm('你确定要删除吗?')
 * handleDelete(): void {
 *     // 进行你的删除逻辑
 * }
 * @param message 删除的提示信息
 */
export function Confirm(message: string, okText?: string, cancelText?: string) {
    return (target: object, key: string, descriptor: PropertyDescriptor) => {
        const originFn = descriptor.value;
        descriptor.value = function(...args: any) {
            const dialogRef = this.dialog.open(ConfirmComponent, {
                data: {
                    message: message,
                    buttonText: {
                        ok: `${okText ? okText : '确定'}`,
                        cancel: `${cancelText ? okText : '取消'}`,
                    }
                }
            });
            dialogRef.afterClosed().subscribe((confirmed: boolean) => {
                if (confirmed) {
                    const result = originFn.apply(this, args);
                    return result;
                }
                return null;
            });
        };
        return descriptor;
    };
}
