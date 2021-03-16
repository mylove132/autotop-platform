import { HomePageComponent } from './home/home-page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginComponent } from './home/login/login.component';
import { NotFoundComponent } from './home/not-found';
import { CommonModule } from '@angular/common';
import { MainComponent } from './home/main';
import { CheckUserGuard } from './guard/check-user.guard';
import { TaskResultComponent } from './home/task-result';
import { SystemLogComponent } from './home/system-log';

const routes: Routes = [
    { path: 'home-page', component: HomePageComponent, children:
        [
            {
                path: '',
                component: MainComponent,
                canActivate: [CheckUserGuard]
            },
            {
                path: 'communication',
                loadChildren: () => import('./modules/communication/communication.module').then(m => m.CommunicationModule),
                canActivate: [CheckUserGuard]
            },
            {
                path: 'conference',
                loadChildren: () => import('./modules/conference/conference.module').then(m => m.ConferenceModule),
                canActivate: [CheckUserGuard]
            },
            {
                path: 'dbm',
                loadChildren: () => import('./modules/dbm/dbm.module').then(m => m.DbmModule),
                canActivate: [CheckUserGuard]
            },
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'system-log', component: SystemLogComponent },
    { path: 'taskResult/:id', component: TaskResultComponent },
    { path: '404', component: NotFoundComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: '404' }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes, {
            useHash: false,
            preloadingStrategy: PreloadAllModules
        }),
    ],
    exports: [
        RouterModule,
    ],
})
export class AppRoutingModule {
}

