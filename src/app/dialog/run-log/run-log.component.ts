import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { SocketioService } from '../../services/socketio.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-run-log',
  templateUrl: './run-log.component.html',
  styleUrls: ['./run-log.component.scss']
})
export class RunLogComponent implements OnInit, OnDestroy {
  msg: string;
  timer: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: number,
    private socketService: SocketioService
  ) { }

  ngOnInit(): void {
    this.msg = this.socketService.log[this.data].log;
    // 创建定时器，每间隔1s拉取最新的日志
    this.timer = setInterval(() => {
      this.msg = this.socketService.log[this.data].log;
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

}
