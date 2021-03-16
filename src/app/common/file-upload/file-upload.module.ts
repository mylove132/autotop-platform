import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileUploadComponent } from './file-upload.component';
import { FileUploadDirective } from './file-upload.directive';

@NgModule({
    declarations: [
        FileUploadComponent,
        FileUploadDirective,
    ],
    imports: [
        CommonModule,
        MatProgressBarModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
    ],
    exports: [
        FileUploadComponent,
        FileUploadDirective
    ],
    providers: [],
})
export class FileUploadModule {}
