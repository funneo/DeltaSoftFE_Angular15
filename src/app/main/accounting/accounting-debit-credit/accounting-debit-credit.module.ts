import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { AccountingDebitCreditComponent } from './accounting-debit-credit.component';
import { AccountingDebitCreditDetailComponent } from './accounting-debit-credit-detail/accounting-debit-credit-detail.component';
import { AccountingDebitCreditRoutingModule } from './accounting-debit-credit-routing.module';

@NgModule({
  declarations: [AccountingDebitCreditComponent, AccountingDebitCreditDetailComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    AccountingDebitCreditRoutingModule,
    Daterangepicker, 
    ModalPhieuChiModule,
    ModalPhieuThuModule
  ]
})
export class AccountingDebitCreditModule { }
