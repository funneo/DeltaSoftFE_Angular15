import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDebitNoteCanonComponent } from './modal-debit-note-canon.component';
import { FormsModule } from '@angular/forms';
import { DebitNoteRoutingModule } from '@app/main/shipments/debit-note/debit-note-routing.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { Daterangepicker } from 'ng2-daterangepicker';
import { BarRatingModule } from 'ngx-bar-rating';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalDebtDebitnotesModule } from '../../accounting/modal-debt-debitnotes/modal-debt-debitnotes.module';
import { ModalPaymentDetailModule } from '../../advance-payment/modal-payment-detail/modal-payment-detail.module';
import { ModalDispatchOrderCbtModule } from '../../cbt/modal-dispatch-order-cbt/modal-dispatch-order-cbt.module';
import { ModalPaymentCbtModule } from '../../cbt/modal-payment-cbt/modal-payment-cbt.module';
import { ModalCsRatingModule } from '../../shipments/modal-cs-rating/modal-cs-rating.module';
import { ModalDebitNoteUpdateExchangeRateModule } from '../../shipments/modal-debit-note-update-exchange-rate/modal-debit-note-update-exchange-rate.module';
import { ModalDebitNoteUpdateInvoiceModule } from '../../shipments/modal-debit-note-update-invoice/modal-debit-note-update-invoice.module';
import { ModalOpenDebitNoteModule } from '../../shipments/modal-open-debit-note/modal-open-debit-note.module';
import { ModalShipmentViewSearchModule } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.module';
import { ModalShipmentModule } from '../../shipments/modal-shipment/modal-shipment.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalDispatchOrderFclModule } from '../../transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';
import { ModalDispatchorderModule } from '../../transports/modal-dispatchorder/modal-dispatchorder.module';
import { ModalListDispatchOrderModule } from '../../transports/modal-list-dispatch-order/modal-list-dispatch-order.module';



@NgModule({
  declarations: [ModalDebitNoteCanonComponent],
  imports: [
   CommonModule,
    ModalModule,
    FormsModule,
    AngularDraggableModule,
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
    ModalDispatchOrderFclModule,
    ModalDispatchOrderCbtModule,
    ModalPaymentCbtModule
  ],exports: [ModalDebitNoteCanonComponent],
})
export class ModalDebitNoteCanonModule { }
