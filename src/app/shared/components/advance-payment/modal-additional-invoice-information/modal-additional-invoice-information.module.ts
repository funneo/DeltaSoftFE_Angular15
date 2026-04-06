import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAdditionalInvoiceInformationComponent } from './modal-additional-invoice-information.component';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalPaymentDetailModule } from '../modal-payment-detail/modal-payment-detail.module';



@NgModule({
  declarations: [ModalAdditionalInvoiceInformationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    Daterangepicker,
    ModalPaymentDetailModule
  ],
  exports:[ModalAdditionalInvoiceInformationComponent]
})
export class ModalAdditionalInvoiceInformationModule { }
