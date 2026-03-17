import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AcceptDebitNoteRoutingModule } from './accept-debit-note-routing.module';
import { AcceptDebitNoteComponent } from './accept-debit-note.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalDebtDebitnotesModule } from '@app/shared/components/accounting/modal-debt-debitnotes/modal-debt-debitnotes.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';


@NgModule({
  declarations: [AcceptDebitNoteComponent],
  imports: [
    CommonModule,
    AcceptDebitNoteRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalShipmentModule,
    NgxSpinnerModule,
  ],
  providers:[
    DatePipe,
  ]
})
export class AcceptDebitNoteModule { }
