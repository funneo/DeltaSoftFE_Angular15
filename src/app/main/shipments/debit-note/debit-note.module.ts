import { ModalDebitNoteUpdateExchangeRateModule } from './../../../shared/components/shipments/modal-debit-note-update-exchange-rate/modal-debit-note-update-exchange-rate.module';
import { ModalDebitNoteUpdateInvoiceModule } from './../../../shared/components/shipments/modal-debit-note-update-invoice/modal-debit-note-update-invoice.module';
import { ModalDebtDebitnotesModule } from './../../../shared/components/accounting/modal-debt-debitnotes/modal-debt-debitnotes.module';
import { ModalDebtModule } from '@app/shared/components/accounting/modal-debt/modal-debt.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { DebitNoteComponent } from './debit-note.component';
import { DebitNoteDetailComponent } from './debit-note-detail/debit-note-detail.component';
import { DebitNoteRoutingModule } from './debit-note-routing.module';
import { ModalCsRatingModule } from '@app/shared/components/shipments/modal-cs-rating/modal-cs-rating.module';
import { BarRatingModule } from 'ngx-bar-rating';
import { ModalOpenDebitNoteModule } from '@app/shared/components/shipments/modal-open-debit-note/modal-open-debit-note.module';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { ModalShipmentViewSearchModule } from '@app/shared/components/shipments/modal-shipment-view-search/modal-shipment-view-search.module';
import { ModalListDispatchOrderModule } from '@app/shared/components/transports/modal-list-dispatch-order/modal-list-dispatch-order.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DispatchorderModule } from '@app/main/transports/dispatchorders/dispatchorder/dispatchorder.module';
import { ModalDispatchorderModule } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.module';
import { ModalPaymentDetailModule } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.module';
import { ModalDebitNotesModule } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.module';
import { ModalImportExcelModule } from '@app/shared/components/systems/modal-import-excel/modal-import-excel.module';
import { ModalUpdateAccountingDateModule } from '@app/shared/components/shipments/modal-update-accounting-date/modal-update-accounting-date.module';
import { ModalDispatchOrderFclModule } from '@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';
import { ModalDispatchOrderCbtModule } from '@app/shared/components/cbt/modal-dispatch-order-cbt/modal-dispatch-order-cbt.module';
import { ModalPaymentCbtModule } from '@app/shared/components/cbt/modal-payment-cbt/modal-payment-cbt.module';

@NgModule({
  declarations: [DebitNoteComponent, DebitNoteDetailComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    DebitNoteRoutingModule,
    Daterangepicker,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalAttachfileModule,
    ModalCsRatingModule,
    BarRatingModule,
    ModalOpenDebitNoteModule,
    ModalShipmentModule,
    ModalShipmentViewSearchModule,
    ModalListDispatchOrderModule,
    ModalDebtDebitnotesModule,
    NgxSpinnerModule,
    ModalDispatchorderModule,
    ModalDebitNoteUpdateInvoiceModule,
    ModalDebitNoteUpdateExchangeRateModule,
    ModalPaymentDetailModule,
    ModalDebitNotesModule,
    ModalImportExcelModule,
    ModalUpdateAccountingDateModule,
    ModalDispatchOrderFclModule,
    ModalDispatchOrderCbtModule,
    ModalPaymentCbtModule
  ],
  providers:[
    DatePipe,
  ]
})
export class DebitNoteModule { }
