import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { darkTheme, SETTINGS_KEY, timeHourglass } from '../config/theme.config';
import { SettingsState } from '../dialog/settings/settings.medel';
import { LocalDataService } from './local-data.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeService implements OnDestroy {
    hour = 0;
    timerId: any;

    constructor(
        private ngZone: NgZone,
        @Inject(DOCUMENT) private document: Document,
        private overlayContainer: OverlayContainer,
        private localDataService: LocalDataService
    ) { }

    // 切换主题
    toggleTheme(theme: string): void {
        if (theme === 'dark') {
            this.overlayContainer.getContainerElement().classList.add(darkTheme);
            this.document.querySelector('app-root').classList.add(darkTheme);
          } else {
            this.overlayContainer.getContainerElement().classList.remove(darkTheme);
            this.document.querySelector('app-root').classList.remove(darkTheme);
          }
    }

    // 自动进入深色模式
    autoNightMode(): void {
        this.ngZone.runOutsideAngular(() =>
            this.timerId = setInterval(() => {
                const hour = new Date().getHours();
                if (hour !== this.hour) {
                    this.hour = hour;
                    this.ngZone.run(() => {
                        const settingConf = JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)) as SettingsState;
                        // tslint:disable-next-line:max-line-length
                        if (settingConf && settingConf.autoNightMode && (settingConf.hour >= timeHourglass.startHour || settingConf.hour <= timeHourglass.endHour)) {
                            this.localDataService.setStorageItem(SETTINGS_KEY, JSON.stringify(
                                Object.assign({}, JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)), {
                                    theme: 'dark'
                                })
                            ));
                            this.toggleTheme('dark');
                        } else if (settingConf && settingConf.autoNightMode) {
                            this.localDataService.setStorageItem(SETTINGS_KEY, JSON.stringify(
                                Object.assign({}, JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)), {
                                    theme: 'light'
                                })
                            ));
                            this.toggleTheme('light');
                        }
                        this.localDataService.setStorageItem(SETTINGS_KEY, JSON.stringify(
                            Object.assign({}, JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)), {
                                hour: hour
                            })
                        ));
                    });
                }
            }, 60_000)
        );
    }

    // 反显之前设置的主题模式
    displayTheme(): void {
        const settingConf = JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)) as SettingsState;
        if (settingConf) {
            this.toggleTheme(settingConf.theme);
        }
    }

    ngOnDestroy(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

}
