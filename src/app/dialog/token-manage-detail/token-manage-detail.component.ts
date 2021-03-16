import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Md2Toast } from '../../common/toast';
import { Token } from '../../modules/conference/token-manage/token-manage.medel';

@Component({
  selector: 'app-token-manage-detail',
  templateUrl: './token-manage-detail.component.html',
  styleUrls: ['./token-manage-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenManageDetailComponent {
  detail: Token; // 详情数据

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Token,
    private toast: Md2Toast,
  ) {
    this.detail = this.data;
  }

  // 复制Token
  copyToken(): void {
    this.toast.show('token复制成功');
  }

}
