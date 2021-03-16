import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SETTINGS_KEY, themeConf } from '../../config/theme.config';
import { LocalDataService } from '../../services/local-data.service';
import { ThemeService } from '../../services/theme.service';
import { SettingsState } from './settings.medel';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  themeList: any[] = []; // 主题配置
  selected = 'light'; // 默认选择浅色模式
  checked = false; // 默认不开启自动深色模式

  constructor(
    private localDataService: LocalDataService,
    private themeService: ThemeService,
    private homeService: HomeService
  ) {
    const settingConf = JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)) as SettingsState;
    if (settingConf) {
      this.selected = settingConf.theme;
      this.checked = settingConf.autoNightMode;
    }
  }

  ngOnInit(): void {
    this.themeList = themeConf;
  }

  // 切换主题
  switchTheme(mEvent: MatSelectChange): void {
    this.selected = mEvent.value;
    this.themeService.toggleTheme(mEvent.value);
    this.localDataService.setStorageItem(SETTINGS_KEY, JSON.stringify(
      Object.assign({}, JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)), {
        theme: mEvent.value
      })
    ));
    this.homeService.echartThemeSubject.next(); // 通知页面上的所有Echart切换主题
  }

  // 自动开启深色模式
  autoNightModeToggle(mEvent: MatSlideToggleChange) {
    this.localDataService.setStorageItem(SETTINGS_KEY, JSON.stringify(
      Object.assign({}, JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)), {
        autoNightMode: mEvent.checked
      })
    ));
  }


}
