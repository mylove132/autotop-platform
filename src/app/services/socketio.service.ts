import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { PerformanceTest } from './../config/network.config';

@Injectable({
    providedIn: 'root'
})
export class SocketioService {
    log: any; // 执行日志
    socket: any; // socket实例

    constructor() { }

    // 建立socket连接
    setupSocketConnection(jmeterId?: number): void {
        // step1 —— 建立socket连接
        this.socket = io(PerformanceTest.Run, {
            transports: ['websocket'],
            secure: true,
        });
        // step2 —— 连接成功之后的回调
        this.socket.on('connect', () => {
            console.log('socket connect success...');
        });
    }

    // 发射socket事件
    emitSocketEvent(jmeterId: number): void {
        // step3 —— 发送jemter指令
        this.socket.emit('jmeter', {
            id: jmeterId
        });
        // step4 —— 监听jemter指令消息回调（运行中）
        this.socket.on('message', (data) => {
            const obj = {};
            obj[jmeterId] = {
                state: 2,
                log: this.log[jmeterId].log += `
                ${data.msg}`
            };
            this.log = { ...this.log, ...obj };
            // step5 —— 监听jemter指令消息回调（结束）
            if (data.code === 80000) {
                const end = {};
                end[jmeterId] = {
                    state: 3,
                    log: this.log[jmeterId].log += `
                    ${data.msg}`
                };
                this.log = { ...this.log, ...end };
            }
        });
    }

    // 断开socket连接
    disconnectSocketConnection(): void {
        this.socket.disconnect();
    }

}
