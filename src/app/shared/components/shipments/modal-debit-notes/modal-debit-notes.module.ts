import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDebitNotesComponent } from './modal-debit-notes.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormControl, FormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';
import { DebitNoteRoutingModule } from '@app/main/shipments/debit-note/debit-note-routing.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { BarRatingModule } from 'ngx-bar-rating';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalDebtDebitnotesModule } from '../../accounting/modal-debt-debitnotes/modal-debt-debitnotes.module';
import { ModalPaymentDetailModule } from '../../advance-payment/modal-payment-detail/modal-payment-detail.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalDispatchorderModule } from '../../transports/modal-dispatchorder/modal-dispatchorder.module';
import { ModalListDispatchOrderModule } from '../../transports/modal-list-dispatch-order/modal-list-dispatch-order.module';
import { ModalCsRatingModule } from '../modal-cs-rating/modal-cs-rating.module';
import { ModalDebitNoteUpdateExchangeRateModule } from '../modal-debit-note-update-exchange-rate/modal-debit-note-update-exchange-rate.module';
import { ModalDebitNoteUpdateInvoiceModule } from '../modal-debit-note-update-invoice/modal-debit-note-update-invoice.module';
import { ModalOpenDebitNoteModule } from '../modal-open-debit-note/modal-open-debit-note.module';
import { ModalShipmentViewSearchModule } from '../modal-shipment-view-search/modal-shipment-view-search.module';
import { ModalShipmentModule } from '../modal-shipment/modal-shipment.module';
import { ModalDispatchOrderFclModule } from '../../transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';
import { ModalDispatchOrderCbtModule } from '../../cbt/modal-dispatch-order-cbt/modal-dispatch-order-cbt.module';
import { ModalPaymentCbtModule } from '../../cbt/modal-payment-cbt/modal-payment-cbt.module';



@NgModule({
  declarations: [ModalDebitNotesComponent],
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
  ],exports:[ModalDebitNotesComponent]
})
export class ModalDebitNotesModule { }
