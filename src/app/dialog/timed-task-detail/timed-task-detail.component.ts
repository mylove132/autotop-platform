import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-timed-task-detail',
  templateUrl: './timed-task-detail.component.html',
  styleUrls: ['./timed-task-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimedTaskDetailComponent {
  detail: any; // 详情数据

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.detail = this.data;
  }

}
