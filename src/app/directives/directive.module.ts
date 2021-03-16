import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { AutoFixedDirective } from './auto-fixed.directive';
import { ClickOutsideDirective } from './click-outside.directive';
import { DebounceClickDirective } from './debounce-click.directive';
import { TooltipDirective } from './tooltip.directive';

// 指令
export const DIRECTIVES = [
    DebounceClickDirective,
    ClickOutsideDirective,
    TooltipDirective,
    AutoFixedDirective
];

@NgModule({
    imports: [
        OverlayModule,
        PortalModule,
    ],
    declarations: [
        ...DIRECTIVES
    ],
    exports: [
        ...DIRECTIVES,
        OverlayModule,
        PortalModule,
    ]
})
export class DirectiveModule { }
