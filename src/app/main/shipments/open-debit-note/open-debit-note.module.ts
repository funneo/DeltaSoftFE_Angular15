import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { OpenDebitNoteComponent } from './open-debit-note.component';
import { OpenDebitNoteRoutingModule } from './open-debit-note-routing.module';
import { ModalOpenDebitNoteModule } from '@app/shared/components/shipments/modal-open-debit-note/modal-open-debit-note.module';
import { ModalDebtDebitnotesModule } from '@app/shared/components/accounting/modal-debt-debitnotes/modal-debt-debitnotes.module';

@NgModule({
  declarations: [OpenDebitNoteComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    OpenDebitNoteRoutingModule,
    Daterangepicker,
    ModalOpenDebitNoteModule,
  ],
  providers:[
    DatePipe,
  ]
})
export class OpenDebitNoteModule { }
