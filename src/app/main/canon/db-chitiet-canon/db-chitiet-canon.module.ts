import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DbChitietCanonRoutingModule } from './db-chitiet-canon-routing.module';
import { DbChitietCanonComponent } from './db-chitiet-canon.component';
import { ModalDebitNotesModule } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.module';
import { FormsModule } from '@angular/forms';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalDebitNoteCanonModule } from '@app/shared/components/canon/modal-debit-note-canon/modal-debit-note-canon.module';


@NgModule({
  declarations: [DbChitietCanonComponent],
  imports: [
    CommonModule,
    DbChitietCanonRoutingModule,
      PaginationModule,
      NgBusyModule,
      FormsModule,
      SharedDirectivesModule,
      PipeSharedModule,
      NgSelectModule,
      Daterangepicker,
      ModalShipmentModule,
      NgxSpinnerModule,
      ModalDebitNoteCanonModule
  ]
})
export class DbChitietCanonModule { }
