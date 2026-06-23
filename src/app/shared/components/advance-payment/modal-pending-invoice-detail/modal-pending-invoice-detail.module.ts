import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalPendingInvoiceDetailComponent } from './modal-pending-invoice-detail.component';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';

@NgModule({
  declarations: [ModalPendingInvoiceDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    AngularDraggableModule,
    SharedDirectivesModule,
  ],
  exports: [ModalPendingInvoiceDetailComponent]
})
export class ModalPendingInvoiceDetailModule { }
