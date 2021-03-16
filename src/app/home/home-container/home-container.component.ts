import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SettingsComponent } from 'src/app/dialog/settings';
import { LocalDataService } from '../../services/local-data.service';
import * as BaseUtil from '../../utils/base.util';

@Component({
  selector: 'app-home-container',
  templateUrl: './home-container.component.html',
  styleUrls: ['./home-container.component.scss']
})
export class HomeContainerComponent implements OnInit, OnDestroy {
  showFiller = false;
  userName;
  menuInfo;
  currMenu = '1';
  parentId;
  resizeSubject: Subscription;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private localDataService: LocalDataService
  ) {
    this.userName = this.localDataService.getUserName();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.localDataService.getMenuInfo().map(v => {
          if (v.childMenus) {
            v.childMenus.map(item => {
              if (item.url === this.stringIntercept(event.url)) {
                this.currMenu = String(item.id);
                this.parentId = String(v.id);
                return;
              }
            });
          } else {
            if (v.url === this.stringIntercept(event.url)) {
              this.currMenu = String(v.id);
              this.parentId = String(v.id);
              return;
            }
          }
          v.iconUrl = this.setMenuIconImage(v);
        });
      }
    });
  }

  // 设置菜单图标
  setMenuIconImage(item, status?) {
    const urlNmae = item.cnName;
    const prefix = 'assets/images';
    switch (String(urlNmae)) {
      case '首页': return status ? `${prefix}/work_icon_active.png` : `${prefix}/work_icon.png`;
      case '自动化测试': return status ? `${prefix}/qtp_icon_active.png` : `${prefix}/qtp_icon.png`;
      case '性能测试': return status ? `${prefix}/perf_icon_active.png` : `${prefix}/perf_icon.png`;
      case '数据库配置': return status ? `${prefix}/db_icon_active.png` : `${prefix}/db_icon.png`;
      default: return `${prefix}/default_icon.png`;
    }
  }

  hoverChangeHandle(event): void {
    const { index, status } = event;
    this.localDataService.getMenuInfo().map(v => {
      if (String(v.id) === String(index)) {
        v.iconUrl = this.setMenuIconImage(v, status);
      } else {
        v.iconUrl = this.setMenuIconImage(v);
      }
      if (v.childMenus) {
        v.childMenus.map(item => {
          if (String(item.id) === String(index)) {
            item.point = status;
          } else {
            item.point = false;
          }
        });
      }
    });
  }

  // 路由URL截取，主要是截取iframe
  stringIntercept(value) {
    const index = String(value).indexOf('=');
    if (index !== -1) {
      const str = value.substring(index + 1);
      return decodeURIComponent(str);
    }
    return value;
  }

  ngOnInit(): void {
    this.menuInfo = this.localDataService.getMenuInfo();
    console.log(new Date());
  }

  togglePage(path): void {
    this.router.navigate([path], { relativeTo: this.route });
  }

  loginOut(): void {
    this.router.navigate(['/login']);
  }

  menuToogle(item): void {
    this.resizeSubject = of('resizeEvent').pipe(
      delay(400)
    ).subscribe(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  // 设置
  setting(): void {
    this.dialog.open(SettingsComponent, {
      minWidth: '500px'
    });
  }

  // 更新日志
  systemLog(): void {
    window.open(`${BaseUtil.currentDomainAddress()}/system-log`, '_blank');
  }

  ngOnDestroy(): void {
    if (this.resizeSubject) {
      this.resizeSubject.unsubscribe();
    }
  }

}
