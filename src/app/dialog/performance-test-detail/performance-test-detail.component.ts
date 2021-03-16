import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-performance-test-detail',
  templateUrl: './performance-test-detail.component.html',
  styleUrls: ['./performance-test-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceTestDetailComponent {
  detail: any;
  type: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.detail = this.data.item;
    this.type = this.data.type;
  }

}
