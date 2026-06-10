import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalPendingInvoicePickerComponent } from './modal-pending-invoice-picker.component';

@NgModule({
  declarations: [ModalPendingInvoicePickerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    Daterangepicker,
    PipeSharedModule,
    SharedDirectivesModule
  ],
  exports: [ModalPendingInvoicePickerComponent]
})
export class ModalPendingInvoicePickerModule { }
