import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportStatementFilterRoutingModule } from './report-statement-filter-routing.module';
import { ReportStatementFilterComponent } from './report-statement-filter.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalDebitNoteUpdateExchangeRateModule } from '@app/shared/components/shipments/modal-debit-note-update-exchange-rate/modal-debit-note-update-exchange-rate.module';
import { ModalDebitNoteUpdateInvoiceModule } from '@app/shared/components/shipments/modal-debit-note-update-invoice/modal-debit-note-update-invoice.module';
import { ModalDebitNotesModule } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.module';


@NgModule({
  declarations: [ReportStatementFilterComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ReportStatementFilterRoutingModule,
    NgxSpinnerModule,
    ModalDebitNoteUpdateInvoiceModule,
    ModalDebitNoteUpdateExchangeRateModule,
    ModalDebitNotesModule
  ]
})
export class ReportStatementFilterModule { }
