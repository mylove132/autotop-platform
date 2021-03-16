import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NestedSelectComponent } from './nested-select.component';
import { SelectItemComponent } from './select-item';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NestedSelectPipe } from './nested-select.pipe';

@NgModule({
    declarations: [
        NestedSelectComponent,
        SelectItemComponent,
        NestedSelectPipe
    ],
    imports: [
        CommonModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        FormsModule
    ],
    exports: [
        NestedSelectComponent,
        SelectItemComponent,
        NestedSelectPipe
    ],
    providers: [],
})
export class NestedSelectodule {}
