import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DragData } from './drag-data.model';
import { DragDropService } from './drag-drop.service';

@Directive({
  selector: '[appDrop]'
})
export class DropDirective {
  @Input() draggedEnterClass: string; // 当拖拽元素放置到目标区域的时候目标区域的样式
  @Input() dropTags: string[] = []; // 目标区域接收拖拽元素携带的标记
  @Input() dropData: any; // 目标区域携带的数据包
  @Output() mDrop: EventEmitter<any> = new EventEmitter(); // 拖拽放置结束
  private data$: Observable<DragData>;

  constructor(
    private el: ElementRef,
    private rd: Renderer2,
    private dds: DragDropService
  ) {
    this.data$ = this.dds.getDragData().pipe(
      take(1)
    );
  }

  // 该事件在拖动的元素进入放置目标时触发
  @HostListener('dragenter', ['$event'])
  onDragEnter(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target) {
      this.data$.subscribe((dragData: DragData) => {
        if (this.dropTags.indexOf(dragData.tag) > -1) {
          this.rd.addClass(this.el.nativeElement, this.draggedEnterClass);
        }
      });
    }
  }

  // 该事件在拖动元素在放置目标上时触发
  @HostListener('dragover', ['$event'])
  onDragOver(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target) {
      this.data$.subscribe((dragData: DragData) => {
        // console.log('得到数据啦....', dragData, this.dropTags);
        if (this.dropTags.indexOf(dragData.tag) > -1) {
          this.rd.setProperty(ev, 'dataTransfer.effectAllowed', 'all');
          this.rd.setProperty(ev, 'dataTransfer.dropEffect', 'move');
        } else {
          this.rd.setProperty(ev, 'dataTransfer.effectAllowed', 'none');
          this.rd.setProperty(ev, 'dataTransfer.dropEffect', 'none');
        }
      });
    }
  }

  // 该事件在拖动元素离开放置目标时触发
  @HostListener('dragleave', ['$event'])
  onDragLeave(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    this.rd.removeClass(this.el.nativeElement, this.draggedEnterClass);
    if (this.el.nativeElement === ev.target) {
      this.data$.subscribe((dragData: DragData) => {
        if (this.dropTags.indexOf(dragData.tag) > -1) {
          this.rd.removeClass(this.el.nativeElement, this.draggedEnterClass);
        }
      });
    }
  }

  // 该事件在拖动元素放置在目标区域时触发
  @HostListener('drop', ['$event'])
  onDrop(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target) {
      this.data$.subscribe((dragData: DragData) => {
        if (this.dropTags.indexOf(dragData.tag) > -1) {
          this.rd.removeClass(this.el.nativeElement, this.draggedEnterClass);
          this.mDrop.emit({
            drag: dragData,
            drop: {
              tag: this.dropTags,
              data: this.dropData
            }
          });
          this.dds.clearDragData();
        }
      });
    }
  }

}
