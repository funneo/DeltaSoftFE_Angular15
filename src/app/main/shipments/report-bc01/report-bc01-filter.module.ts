import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportBc01FilterRoutingModule } from './report-bc01-filter-routing.module';
import { ReportBc01FilterComponent } from './report-bc01-filter.component';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalDispatchorderModule } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.module';
import { ModalDispatchOrderAdditionalFeeModule } from '@app/shared/components/transports/modal-dispatch-order-additional-fee/modal-dispatch-order-additional-fee.module';
import { ModalDebitNotesModule } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.module';
import { ModalPaymentDetailModule } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.module';


@NgModule({
  declarations: [ReportBc01FilterComponent],
  imports: [
    CommonModule,
    ReportBc01FilterRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalShipmentModule,
    NgxSpinnerModule,
    ModalDispatchorderModule,
    ModalDispatchOrderAdditionalFeeModule,
    ModalDebitNotesModule,
    ModalPaymentDetailModule
  ]
})
export class ReportBc01FilterModule { }
