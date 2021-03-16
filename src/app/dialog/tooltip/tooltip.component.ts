import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input, OnInit, HostBinding, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class TooltipComponent implements OnInit {
  @Input() contentType: string; // tempate
  @Input() value = '';
  @Input() theme: string; // 'light' or 'dark'
  @Output() leave = new EventEmitter<boolean>();
  @HostBinding('style.background-color') get backgroundColor() {
    if (!this.theme || this.theme === 'dark') {
      return '#292929';
    } else {
      return 'white';
    }
  }
  @HostBinding('style.color') get getColor() {
    if (!this.theme || this.theme === 'dark') {
      return 'white';
    } else {
      return '#4A4A4A';
    }
  }

  @HostListener('mouseenter')
  mouseover(): void {
    this.leave.emit(false);
  }

  @HostListener('mouseleave')
  mouseleave(): void {
    this.leave.emit(true);
  }


  constructor() { }

  ngOnInit(): void { }

}
