import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestNewEmployeeRoutingModule } from './request-new-employee-routing.module';
import { RequestNewEmployeeComponent } from './request-new-employee.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalRequestNewEmployeeModule } from '@app/shared/components/garage/modal-request-new-employee/modal-request-new-employee.module';


@NgModule({
  declarations: [RequestNewEmployeeComponent],
  imports: [
    CommonModule,
    RequestNewEmployeeRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalRequestNewEmployeeModule
  ],
})
export class RequestNewEmployeeModule {}
