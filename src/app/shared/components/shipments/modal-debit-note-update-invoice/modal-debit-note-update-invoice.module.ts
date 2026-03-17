import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDebitNoteUpdateInvoiceComponent } from './modal-debit-note-update-invoice.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';



@NgModule({
  declarations: [ModalDebitNoteUpdateInvoiceComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    Daterangepicker,
  ],exports:[ModalDebitNoteUpdateInvoiceComponent]
})
export class ModalDebitNoteUpdateInvoiceModule { }
