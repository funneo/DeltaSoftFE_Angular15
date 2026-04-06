import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OvertimeRoutingModule } from './overtime-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalOvertimeModule } from '@app/shared/components/hrm/modal-overtime/modal-overtime.module';
import { OvertimeComponent } from './overtime.component';


@NgModule({
  declarations: [OvertimeComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    OvertimeRoutingModule,
    ModalOvertimeModule
  ]
})
export class OvertimeModule { }
