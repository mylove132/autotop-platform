import { NgModule, ModuleWithProviders } from '@angular/core';
import { DateFormatPipe } from './date.pipe';
import { EmptyPipe } from './empty.pipe';
import { HttpTypePipe } from './http-type.pipe';
import { PluckPipe } from './pluck.pipe';
import { DiffPipe } from './diff.pipe';
import { ParamTypePipe } from './param-type.pipe';
import { ExecutorPipe } from './executor.pipe';
import { ExecutePipe } from './excute.pipe';
import { TimedTaskStatePipe } from './timed-task-state.pipe';
import { OperationModulePipe } from './operation-module.pipe';
import { OperationTypePipe } from './operation-type.pipe';
import { ObjectPipe } from './object.pipe';
import { TaskTypePipe } from './task-type.pipe';
import { JmeterStatePipe } from './jmeter-state.pipe';
import { RelativeTimePipe } from './relative-time.pipe';

const PIPES = [
    DateFormatPipe,
    EmptyPipe,
    HttpTypePipe,
    PluckPipe,
    DiffPipe,
    ParamTypePipe,
    ExecutorPipe,
    ExecutePipe,
    TimedTaskStatePipe,
    OperationModulePipe,
    OperationTypePipe,
    ObjectPipe,
    TaskTypePipe,
    JmeterStatePipe,
    RelativeTimePipe,
];

@NgModule({
    declarations: [...PIPES],
    exports: [...PIPES]
})
export class PipeModule {
    static forRoot(): ModuleWithProviders<PipeModule> {
        return {
            ngModule: PipeModule
        };
    }
}
