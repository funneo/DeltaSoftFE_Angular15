import { ModalAdditionalInvoiceInformationModule } from './../../../shared/components/advance-payment/modal-additional-invoice-information/modal-additional-invoice-information.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PaymentDebtInvoiceRoutingModule } from './payment-debt-invoice-routing.module';
import { PaymentDebtInvoiceComponent } from './payment-debt-invoice.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ReportPaymentDetailRoutingModule } from '../report-payment-detail/report-payment-detail-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';


@NgModule({
  declarations: [PaymentDebtInvoiceComponent],
  imports: [
    CommonModule,
    PaymentDebtInvoiceRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ReportPaymentDetailRoutingModule,
    Daterangepicker,
    NgxSpinnerModule,
    ModalAdditionalInvoiceInformationModule
  ],
  providers:[
    DatePipe,
  ]
})
export class PaymentDebtInvoiceModule { }
