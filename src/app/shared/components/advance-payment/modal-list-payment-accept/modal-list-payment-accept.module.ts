import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalListPaymentAcceptComponent } from './modal-list-payment-accept.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';



@NgModule({
  declarations: [ModalListPaymentAcceptComponent],
  imports: [
    CommonModule,
    ModalModule,
    AngularDraggableModule,
  ],exports:[ModalListPaymentAcceptComponent]
})
export class ModalListPaymentAcceptModule { }
