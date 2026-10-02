import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalGaragePaymentRequestComponent } from './modal-garage-payment-request.component';

@NgModule({
  declarations: [ModalGaragePaymentRequestComponent],
  imports: [
    CommonModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    TabsModule.forRoot()
  ],
  exports: [ModalGaragePaymentRequestComponent]
})
export class ModalGaragePaymentRequestModule { }
