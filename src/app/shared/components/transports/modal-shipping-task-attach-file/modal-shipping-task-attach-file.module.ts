import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalShippingTaskAttachFileComponent } from './modal-shipping-task-attach-file.component';
import { FormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [ModalShippingTaskAttachFileComponent],
  imports: [
    CommonModule,
     ModalModule,
        FormsModule,
        NgBusyModule,
        AngularDraggableModule,
  ],exports: [ModalShippingTaskAttachFileComponent],
})
export class ModalShippingTaskAttachFileModule { }
