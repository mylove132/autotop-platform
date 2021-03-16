import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * svg图标加载器
 * API文档: https://material.angular.io/components/icon/api
 * @param ir Icon注册器
 * @param ds Dom扫描器
 */
export const loadSvgResources = (ir: MatIconRegistry, ds: DomSanitizer) => {
    const imgDir = 'assets/images';
    const iconDir = 'assets/icons';
    const svgDir = `${imgDir}/svg`;
    // blingabc
    ir.addSvgIconInNamespace('assets', 'blingabc', ds.bypassSecurityTrustResourceUrl(`${iconDir}/logo.svg`));
    // 定时任务图标
    ir.addSvgIcon('restart', ds.bypassSecurityTrustResourceUrl(`${svgDir}/restart.svg`));
    ir.addSvgIcon('stop', ds.bypassSecurityTrustResourceUrl(`${svgDir}/stop.svg`));
    // 设置
    ir.addSvgIcon('paint-brush', ds.bypassSecurityTrustResourceUrl(`${svgDir}/paint-brush.svg`));
    ir.addSvgIcon('lightbulb', ds.bypassSecurityTrustResourceUrl(`${svgDir}/lightbulb.svg`));
    // 用例执行结果（静态页面）
    ir.addSvgIcon('error_circle', ds.bypassSecurityTrustResourceUrl(`${svgDir}/error_circle.svg`));
    // loading
    ir.addSvgIcon('loading', ds.bypassSecurityTrustResourceUrl(`${svgDir}/loading.svg`));
    // log-search日志查询
    ir.addSvgIcon('log-search', ds.bypassSecurityTrustResourceUrl(`${svgDir}/log-search.svg`));
    // 数据库配置
    ir.addSvgIcon('host', ds.bypassSecurityTrustResourceUrl(`${svgDir}/host.svg`));
    ir.addSvgIcon('port', ds.bypassSecurityTrustResourceUrl(`${svgDir}/port.svg`));
    ir.addSvgIcon('user', ds.bypassSecurityTrustResourceUrl(`${svgDir}/user.svg`));
    ir.addSvgIcon('database', ds.bypassSecurityTrustResourceUrl(`${svgDir}/database.svg`));
    ir.addSvgIcon('date', ds.bypassSecurityTrustResourceUrl(`${svgDir}/date.svg`));
    ir.addSvgIcon('checkmark', ds.bypassSecurityTrustResourceUrl(`${svgDir}/checkmark.svg`));
};
