import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HistoryLog } from '../../modules/conference/history-log';

@Component({
  selector: 'app-history-log-detail',
  templateUrl: './history-log-detail.component.html',
  styleUrls: ['./history-log-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryLogDetailComponent {
  detail: HistoryLog; // 详情数据
  options = { // JSON配置项
    mode: 'view',
    mainMenuBar: false,
    statusBar: false,
    navigationBar: false,
    expandAll: true
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: HistoryLog
  ) {
    this.detail = this.data;
  }

}
