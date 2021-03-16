import { Directive, ElementRef, HostListener, Input, Renderer2, Output, EventEmitter } from '@angular/core';
import { DragDropService } from './drag-drop.service';

@Directive({
  selector: '[appDrag]'
})
export class DragDirective {
  @Input() dragTag: string; // 拖拽携带的标记
  @Input() dragData: any; // 拖拽携带的数据包
  @Input() draggedClass: string; // 拖拽之后被拖拽元素的样式
  @Output() mDragStart = new EventEmitter<any>(); // 开始拖拽
  @Output() mDragOver = new EventEmitter<any>(); // 拖拽元素在目标区域内移动
  @Output() mDragend = new EventEmitter<any>(); // // 结束拖拽
  private isDraggble = false; // 是否可拖动，默认不可拖动

  @Input('appDrag')
  set isDraggable(val: boolean) {
    this.isDraggble = val;
    this.rd.setAttribute(this.el.nativeElement, 'draggable', `${val}`);
  }

  get isDraggable() {
    return this.isDraggble;
  }

  constructor(
    private el: ElementRef,
    private rd: Renderer2,
    private dds: DragDropService
  ) { }

  // 该事件在用户开始拖动元素时触发
  @HostListener('dragstart', ['$event'])
  onDragStart(ev: Event) {
    if (this.el.nativeElement === ev.target) {
      this.rd.addClass(this.el.nativeElement, this.draggedClass);
      this.dds.setDragData({
        tag: this.dragTag,
        data: this.dragData
      });
      this.mDragStart.emit({
        tag: this.dragTag,
        data: this.dragData
      });
    }
  }

  // 该事件在被拖动的对象在另一对象容器范围内拖动时触发
  @HostListener('dragover', ['$event'])
  onDragOver(ev: Event) {
    if (this.el.nativeElement === ev.target) {
      this.mDragOver.emit({
        event: ev,
        tag: this.dragTag,
        data: this.dragData
      });
    }
  }

  // 该事件在用户完成元素的拖动时触发
  @HostListener('dragend', ['$event'])
  onDragEnd(ev: Event) {
    if (this.el.nativeElement === ev.target) {
      this.rd.removeClass(this.el.nativeElement, this.draggedClass);
      this.mDragend.emit(ev);
    }
  }

}
