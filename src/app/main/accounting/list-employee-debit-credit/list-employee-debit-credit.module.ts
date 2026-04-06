import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ListEmployeeDebitCreditRoutingModule } from './list-employee-debit-credit-routing.module';
import { ListEmployeeDebitCreditComponent } from './list-employee-debit-credit.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalAdvanceModule } from '@app/shared/components/advance-payment/modal-advance/modal-advance.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [ListEmployeeDebitCreditComponent],
  imports: [
    CommonModule,
    Daterangepicker,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ListEmployeeDebitCreditRoutingModule,
    ModalAdvanceModule,
    NgxSpinnerModule
  ],
  providers:[
    DatePipe,
  ]
})
export class ListEmployeeDebitCreditModule { }
