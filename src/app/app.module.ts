import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import zh_Hans from '@angular/common/locales/zh-Hans';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonComponentsModule } from './common';
import { BaseComponentModule } from './common/base-component/base.module';
import { MenusModule } from './common/menu/module';
import { DialogModule } from './dialog/dialog.module';
import { CheckUserGuard } from './guard/check-user.guard';
import { HomePageComponent } from './home/home-page';
import { HomeContainerComponent } from './home/home-container';
import { LoginComponent } from './home/login/login.component';
import { MainComponent } from './home/main';
import { NotFoundComponent } from './home/not-found';
import { NetworkInterceptor } from './interceptor/network.interceptor';
import { LocalDataService } from './services/local-data.service';
import { getDutchPaginatorIntl } from './services/pagination.service';
import { ServicesModule } from './services/services.module';
import { ThemeService } from './services/theme.service';
import { TaskResultComponent } from './home/task-result';
import { PipeModule } from './pipes/pipe.module';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { MarkdownModule } from 'ngx-markdown';
import { SystemLogComponent } from './home/system-log';
// EChart相关
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
// markdown相关 Start
import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
// markdown相关 End
registerLocaleData(zh_Hans);


const APP_MODULE = [
  AppRoutingModule,
  ServicesModule,
  DialogModule,
  HttpClientModule,
  BrowserModule,
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  BrowserAnimationsModule,
  CommonComponentsModule,
  BaseComponentModule,
  MenusModule,
  MatProgressSpinnerModule,
  MatTableModule,
  PipeModule.forRoot(),
  NgJsonEditorModule,
  MarkdownModule.forRoot(),
  NgxEchartsModule.forRoot({
    echarts,
  }),
];

const COMPONENTS = [
  AppComponent,
  NotFoundComponent,
  LoginComponent,
  HomePageComponent,
  MainComponent,
  TaskResultComponent,
  SystemLogComponent,
  HomeContainerComponent,
];

@NgModule({
  declarations: [
    ...COMPONENTS,
  ],
  imports: [
    ...APP_MODULE,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }),
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NetworkInterceptor,
      multi: true,
    },
    LocalDataService,
    CheckUserGuard,
    { provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {

  constructor(
    private themeService: ThemeService
  ) {
    this.themeService.displayTheme();
    this.themeService.autoNightMode();
  }

}
