import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { EmployeeDebitClosingRoutingModule } from './employee-debit-closing-routing.module';
import { EmployeeDebitClosingComponent } from './employee-debit-closing.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalEmployeeDebitClosingModule } from '@app/shared/components/advance-payment/modal-employee-debit-closing/modal-employee-debit-closing.module';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [EmployeeDebitClosingComponent],
  imports: [
    CommonModule,
    EmployeeDebitClosingRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    TabsModule.forRoot(),
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalEmployeeDebitClosingModule
  ],
  providers: [
    DatePipe,
  ]
})
export class EmployeeDebitClosingModule { }
