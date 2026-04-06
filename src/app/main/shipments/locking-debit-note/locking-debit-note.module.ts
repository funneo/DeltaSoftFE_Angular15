import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { LockingDebitNoteRoutingModule } from './locking-debit-note-routing.module';
import { LockingDebitNoteComponent } from './locking-debit-note.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [LockingDebitNoteComponent],
  imports: [
    CommonModule,
    LockingDebitNoteRoutingModule,
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
export class LockingDebitNoteModule { }
