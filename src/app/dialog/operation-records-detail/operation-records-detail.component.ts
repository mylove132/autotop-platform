import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OperationRecords } from '../../modules/conference/operation-records/operation-records.model';

@Component({
  selector: 'app-operation-records-detail',
  templateUrl: './operation-records-detail.component.html',
  styleUrls: ['./operation-records-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationRecordsDetailComponent {
  detail: OperationRecords; // 详情数据
  options = { // JSON配置项
    mode: 'view',
    mainMenuBar: false,
    statusBar: false,
    navigationBar: false,
    expandAll: true
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OperationRecords
  ) {
    this.detail = this.data;
  }

}
