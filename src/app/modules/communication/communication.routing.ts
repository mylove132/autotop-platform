import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RequestTableComponent} from './request-table/request-table.component';
const routes: Routes = [
    { path: 'request-table', component: RequestTableComponent },
    { path: '', redirectTo: 'request-table'}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommunicationRoutingModule {
}
