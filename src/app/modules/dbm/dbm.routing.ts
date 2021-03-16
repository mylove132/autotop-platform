import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DbListComponent } from './db-list';

const routes: Routes = [
    { path: 'db-list', component: DbListComponent },
    { path: '', redirectTo: 'db-list'}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DbmRoutingModule { }
