import { Component, OnDestroy, OnInit } from '@angular/core';
import { empty, of, Subject, forkJoin } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Md2Toast } from '../../common/toast';
import { SETTINGS_KEY } from '../../config/theme.config';
import { SettingsState } from '../../dialog/settings/settings.medel';
import { LoadingService } from '../../services/loading.service';
import { LocalDataService } from '../../services/local-data.service';
import { HomeService } from './../../services/home.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  private onDestroy = new Subject<void>(); // 取消订阅，防止内存泄露
  barOptions = {}; // 柱状图
  intfPieOptions = {}; // 接口饼图
  casePieOptions = {}; // 用例饼图
  timedTaskBarOptions = {}; // 定时任务柱状图
  intfRatioOptions = {}; // 接口执行占比饼图
  theme: string; // 主题

  constructor(
    private mToast: Md2Toast,
    private homeService: HomeService,
    private loadingService: LoadingService,
    private localDataService: LocalDataService
  ) {
    this.homeService.echartThemeSubject.pipe(
      takeUntil(this.onDestroy)
    ).subscribe(_ => this.initEchartTheme());
  }

  ngOnInit(): void {
    this.initEchartTheme();
    this.getEchartSummaryData();
    this.getTimedTaskSummaryData();
  }

  // 初始化Echart主题
  initEchartTheme(): void {
    const settingConf = JSON.parse(this.localDataService.getStorageItem(SETTINGS_KEY)) as SettingsState;
    if (settingConf && settingConf.theme === 'dark') {
      this.theme = 'dark';
    } else {
      this.theme = 'bling-echart';
    }
  }

  // 获取Echart汇总数据
  getEchartSummaryData(): void {
    this.loadingService.show();
    let intfCount = 0;
    this.homeService.getIntfSummary().pipe(
      takeUntil(this.onDestroy),
      tap(x => {
        if (x.result) {
          intfCount = x.data || 0;
        } else {
          this.loadingService.hide();
        }
      }),
      switchMap(x => x.result ? this.homeService.getIntfAndCtlgSummary() : of()),
      catchError(_ => {
        this.loadingService.hide();
        return empty();
      })
    ).subscribe(res => {
      if (res.result) {
        const info = res.data || [];
        this.drawEchart(intfCount, info);
      } else {
        this.mToast.show(res.data);
      }
      this.loadingService.hide();
    });
  }

  // 绘制柱状图和饼图
  drawEchart(total: number, data: any[]): void {
    // 空数据处理
    if (!total || data.length === 0) {
      this.barOptions = this.intfPieOptions = this.casePieOptions = {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center'
        }
      };
      return;
    }
    // 柱状图
    this.barOptions = {
      title: {
        text: '平台接口用例汇总',
        subtext: `接口总数：${total}\n用例总数：${data.map(v => v.count.caseNum).reduce((pre, curr) => pre + curr)}`,
        subtextStyle: {
          lineHeight: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['接口', '用例']
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['stack', 'line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: data.map(v => v.name)
      },
      series: [
        {
          name: '接口',
          type: 'bar',
          data: data.map(v => v.count.insNum)
        },
        {
          name: '用例',
          type: 'bar',
          data: data.map(v => v.count.caseNum)
        }
      ]
    };
    // 接口饼图
    this.intfPieOptions = {
      title: {
        text: '平台接口汇总',
        subtext: `接口总数：${total}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(v => v.name)
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: {
            show: true,
            type: ['pie', 'funnel']
          },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      series: [
        {
          name: `接口总数：${total}`,
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: data.map(v => ({ value: v.count.insNum, name: v.name })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    // 用例饼图
    this.casePieOptions = {
      title: {
        text: '平台用例汇总',
        subtext: `用例总数：${data.map(v => v.count.caseNum).reduce((pre, curr) => pre + curr)}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(v => v.name)
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: {
            show: true,
            type: ['pie', 'funnel']
          },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      series: [
        {
          name: `用例总数：${data.map(v => v.count.caseNum).reduce((pre, curr) => pre + curr)}`,
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: data.map(v => ({ value: v.count.caseNum, name: v.name })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  // 批量获取定时任务统计信息
  getTimedTaskSummaryData(): void {
    const batchObservable = [];
    batchObservable.push(this.homeService.getIntfExecuteCount());
    batchObservable.push(this.homeService.getIntfTimedTaskCount());
    batchObservable.push(this.homeService.getIntfTimedTaskExecuteCount());
    batchObservable.push(this.homeService.getJmeterTimedTaskCount());
    batchObservable.push(this.homeService.getJmeterTimedTaskExecuteCount());
    forkJoin(batchObservable).pipe(
      takeUntil(this.onDestroy)
    ).subscribe(batch => {
      if (batch.length > 0) {
        // 定时任务柱状图
        this.timedTaskBarOptions = {
          title: {
            text: '平台定时任务汇总',
            subtext: '单位：次数',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          xAxis: {
            type: 'category',
            data: ['接口', '接口执行', 'jmeter', 'jmeter执行']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [
              this.handleStatisticsCounter(batch[1]),
              this.handleStatisticsCounter(batch[2]),
              this.handleStatisticsCounter(batch[3]),
              this.handleStatisticsCounter(batch[4])
            ],
            type: 'bar'
          }],
          toolbox: {
            show: true,
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          }
        };
        // 接口执行占比饼图
        this.intfRatioOptions = {
          title: {
            text: '平台活跃度汇总',
            subtext: '单位：次数',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 0,
            data: ['接口执行', '接口定时任务执行', 'jmeter定时任务执行']
          },
          toolbox: {
            show: true,
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
              magicType: {
                show: true,
                type: ['pie', 'funnel']
              },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          series: [
            {
              name: '统计信息',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '30',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: this.handleStatisticsCounter(batch[0]), name: '接口执行' },
                { value: this.handleStatisticsCounter(batch[2]), name: '接口定时任务执行' },
                { value: this.handleStatisticsCounter(batch[4]), name: 'jmeter定时任务执行' }
              ]
            }
          ]
        };
      } else {
        this.timedTaskBarOptions = {
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'center'
          }
        };
      }
    });
  }

  // 统一处理统计计数
  handleStatisticsCounter(info: any): any {
    if (info.result) {
      return info.data || 0;
    } else {
      return 0;
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
