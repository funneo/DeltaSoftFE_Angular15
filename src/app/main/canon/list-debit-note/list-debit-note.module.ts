import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ListDebitNoteRoutingModule } from "./list-debit-note-routing.module";
import { ListDebitNoteComponent } from "./list-debit-note.component";
import { FormsModule } from "@angular/forms";
import { DebitNoteRoutingModule } from "@app/main/shipments/debit-note/debit-note-routing.module";
import { ModalDebtDebitnotesModule } from "@app/shared/components/accounting/modal-debt-debitnotes/modal-debt-debitnotes.module";
import { ModalPaymentDetailModule } from "@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.module";
import { ModalDispatchOrderCbtModule } from "@app/shared/components/cbt/modal-dispatch-order-cbt/modal-dispatch-order-cbt.module";
import { ModalPaymentCbtModule } from "@app/shared/components/cbt/modal-payment-cbt/modal-payment-cbt.module";
import { ModalCsRatingModule } from "@app/shared/components/shipments/modal-cs-rating/modal-cs-rating.module";
import { ModalDebitNoteUpdateExchangeRateModule } from "@app/shared/components/shipments/modal-debit-note-update-exchange-rate/modal-debit-note-update-exchange-rate.module";
import { ModalDebitNoteUpdateInvoiceModule } from "@app/shared/components/shipments/modal-debit-note-update-invoice/modal-debit-note-update-invoice.module";
import { ModalDebitNotesModule } from "@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.module";
import { ModalOpenDebitNoteModule } from "@app/shared/components/shipments/modal-open-debit-note/modal-open-debit-note.module";
import { ModalShipmentViewSearchModule } from "@app/shared/components/shipments/modal-shipment-view-search/modal-shipment-view-search.module";
import { ModalShipmentModule } from "@app/shared/components/shipments/modal-shipment/modal-shipment.module";
import { ModalUpdateAccountingDateModule } from "@app/shared/components/shipments/modal-update-accounting-date/modal-update-accounting-date.module";
import { ModalAttachfileModule } from "@app/shared/components/systems/modal-attachfile/modal-attachfile.module";
import { ModalImportExcelModule } from "@app/shared/components/systems/modal-import-excel/modal-import-excel.module";
import { ModalDispatchOrderFclModule } from "@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module";
import { ModalDispatchorderModule } from "@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.module";
import { ModalListDispatchOrderModule } from "@app/shared/components/transports/modal-list-dispatch-order/modal-list-dispatch-order.module";
import { SharedDirectivesModule } from "@app/shared/directives/shared-directives.module";
import { PipeSharedModule } from "@app/shared/pipes/pipe-shared.module";
import { UtilityService } from "@app/shared/services";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgBusyModule } from "ng-busy";
import { Daterangepicker } from "ng2-daterangepicker";
import { BarRatingModule } from "ngx-bar-rating";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { NgxMaskModule } from "ngx-mask";
import { NgxSpinnerModule } from "ngx-spinner";

@NgModule({
  declarations: [ListDebitNoteComponent],
  imports: [
    CommonModule,
    ListDebitNoteRoutingModule,
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
    ModalPaymentCbtModule,
  ],
})
export class ListDebitNoteModule {}
