import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalQuotationCustomerExtendComponent } from './modal-quotation-customer-extend.component';

@NgModule({
  declarations: [ModalQuotationCustomerExtendComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    AngularDraggableModule,
    Daterangepicker,
  ],
  exports: [ModalQuotationCustomerExtendComponent]
})
export class ModalQuotationCustomerExtendModule { }
