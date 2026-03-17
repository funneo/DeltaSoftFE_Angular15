import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PersonalLoanComponent } from './personal-loan.component';
import { PersonalLoanRoutingModule } from './personal-loan-routing.module';
import { ModalPersonalLoanModule } from '@app/shared/components/advance-payment/modal-personal-loan/modal-personal-loan.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalRepaymentHistoryModule } from '@app/shared/components/advance-payment/modal-repayment-history/modal-repayment-history.module';
import { ModalListPersonalLoanLogModule } from '@app/shared/components/advance-payment/modal-list-personal-loan-log/modal-list-personal-loan-log.module';

@NgModule({
  declarations: [PersonalLoanComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PersonalLoanRoutingModule,
    ModalPersonalLoanModule,
    ModalPhieuChiModule,
    Daterangepicker,
    ModalRepaymentHistoryModule,
    ModalListPersonalLoanLogModule
  ]
})
export class PersonalLoanModule { }
