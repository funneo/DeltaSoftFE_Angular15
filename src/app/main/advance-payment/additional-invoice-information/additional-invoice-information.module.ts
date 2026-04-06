import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AdditionalInvoiceInformationRoutingModule } from './additional-invoice-information-routing.module';
import { AdditionalInvoiceInformationComponent } from './additional-invoice-information.component';
import { ModalAdditionalInvoiceInformationModule } from '@app/shared/components/advance-payment/modal-additional-invoice-information/modal-additional-invoice-information.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalPaymentDetailModule } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.module';


@NgModule({
  declarations: [AdditionalInvoiceInformationComponent],
  imports: [
    CommonModule,
    AdditionalInvoiceInformationRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalAdditionalInvoiceInformationModule,
    ModalPaymentDetailModule
  ],
  providers: [
    DatePipe,
  ]
})
export class AdditionalInvoiceInformationModule { }
