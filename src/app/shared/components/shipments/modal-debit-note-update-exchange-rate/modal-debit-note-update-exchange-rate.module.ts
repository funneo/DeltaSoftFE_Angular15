import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDebitNoteUpdateExchangeRateComponent } from './modal-debit-note-update-exchange-rate.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [ModalDebitNoteUpdateExchangeRateComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    Daterangepicker,
  ],exports:[ModalDebitNoteUpdateExchangeRateComponent]
})
export class ModalDebitNoteUpdateExchangeRateModule { }
