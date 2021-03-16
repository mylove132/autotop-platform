import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { loadSvgResources } from './config/svg.config';
import { BaseService } from './services/base.service';
import { SwUpdatesService } from './services/sw-updates.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  workbenchOpen = false;
  closeButton = false;
  username: string;

  constructor(
    private router: Router,
    public baseService: BaseService,
    private domSanitizer: DomSanitizer,
    private iconRegistry: MatIconRegistry,
    private swUpdates: SwUpdatesService
  ) {
    if (environment.production) {
      console.log = () => { };
      console.error = () => { };
    }
    loadSvgResources(this.iconRegistry, this.domSanitizer);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (JSON.parse(localStorage.getItem('info'))) {
          this.username = JSON.parse(localStorage.getItem('info')).username;
        }
      }
    });
  }

  ngOnInit(): void {
    this.swUpdates.updateActivated.subscribe(_ => {
      if (confirm('检测到版本更新，是否更新到最新版本？(╯#-_-)╯~~')) {
        window.location.reload();
      }
    });
  }

}
