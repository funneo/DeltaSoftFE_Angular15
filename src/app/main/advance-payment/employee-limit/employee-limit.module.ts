import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { EmployeeLimitComponent } from './employee-limit.component';
import { EmployeeLimitRoutingModule } from './employee-limit-routing.module';
import { ModalEmployeeLimitModule } from '@app/shared/components/advance-payment/modal-employee-limit/modal-employee-limit.module';

@NgModule({
  declarations: [EmployeeLimitComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    EmployeeLimitRoutingModule,
    ModalEmployeeLimitModule,
    Daterangepicker
  ]
})
export class EmployeeLimitModule { }
