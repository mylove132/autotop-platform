import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent {

  constructor(
      public dialogRef: MatDialogRef<ReportComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  closeModal(): void {
      this.dialogRef.close();
  }

}
