import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit, AfterViewInit {

  loadStatusEnum = LoadStatusEnum;


  @Input()
  loadStatus: LoadStatusEnum = LoadStatusEnum.Loading;

  @Input()
  errorInfo = '哎呦，网页被偷跑了~';

  @Input()
  emptyInfo = '没有数据哦~';

  @Input()
  loginBase = false;

  @Input() exceptHeight;

  @Output() tryLoadAgainEvent: EventEmitter<any> = new EventEmitter();

  constructor(
  ) {
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
  }

  calcHeight() {
    return {
      'min-height': `${document.body.clientHeight - this.exceptHeight - 60 - 50}px`
    };
  }

  showLoading() {
    this.loadStatus = LoadStatusEnum.Loading;
  }

  showError() {
    this.loadStatus = LoadStatusEnum.LoadError;
  }

  showEmpty() {
    this.loadStatus = LoadStatusEnum.LoadEmpty;
  }

  showContent() {
    this.loadStatus = LoadStatusEnum.LoadData;
  }

}

export enum LoadStatusEnum {
  Loading, LoadError, LoadEmpty, LoadData
}
