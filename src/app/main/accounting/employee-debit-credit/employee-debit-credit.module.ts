import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { EmployeeDebitCreditComponent } from './employee-debit-credit.component';
import { EmployeeDebitCreditDetailComponent } from './employee-debit-credit-detail/employee-debit-credit-detail.component';
import { EmployeeDebitCreditRoutingModule } from './employee-debit-credit-routing.module';
import { ModalAdvanceModule } from '@app/shared/components/advance-payment/modal-advance/modal-advance.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [EmployeeDebitCreditComponent,EmployeeDebitCreditDetailComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    ModalModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    EmployeeDebitCreditRoutingModule,
    Daterangepicker,
    ModalAdvanceModule,
    TabsModule.forRoot(),
    NgxSpinnerModule
  ],exports:[EmployeeDebitCreditDetailComponent]
})
export class EmployeeDebitCreditModule { }
