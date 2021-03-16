import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigManageComponent } from './config-manage';
import { EndpointManageComponent } from './endpoint-manage';
import { HistoryLogComponent } from './history-log';
import { TimedTaskComponent } from './timed-task';
import { TokenManageComponent } from './token-manage';
import { OperationRecordsComponent } from './operation-records';
import { PerformanceTestComponent } from './performance-test';

const routes: Routes = [
    { path: 'config-manage', component: ConfigManageComponent },
    { path: 'endpoint-manage', component: EndpointManageComponent },
    { path: 'history-log', component: HistoryLogComponent },
    { path: 'timed-task', component: TimedTaskComponent },
    { path: 'token-manage', component: TokenManageComponent },
    { path: 'operation-records', component: OperationRecordsComponent },
    { path: 'performance-test', component: PerformanceTestComponent },
    { path: '', redirectTo: 'config-manage'}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ConferenceRoutingModule { }
