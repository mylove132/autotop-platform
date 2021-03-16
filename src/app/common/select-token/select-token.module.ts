import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { SelectTokenComponent } from './select-token.component';

@NgModule({
    declarations: [
        SelectTokenComponent,
    ],
    imports: [
        CommonModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        SelectTokenComponent,
    ],
    providers: []
})
export class SelectToeknModule {}
