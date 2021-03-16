import { Component, Inject, OnInit } from '@angular/core';
import { LOADING_CONTAINER_DATA } from '../../config/injection-token';

@Component({
    selector: 'app-coco',
    templateUrl: './coco.component.html',
    styleUrls: ['./coco.component.scss']
})
export class CocoComponent implements OnInit {
    message = '正在加载，请稍后...'; // loading文案

    constructor(
        @Inject(LOADING_CONTAINER_DATA) public componentData: {message: string}
    ) {
        const { message } = this.componentData;
        if (message) {
            this.message = message;
        }
    }

    ngOnInit(): void { }
}
