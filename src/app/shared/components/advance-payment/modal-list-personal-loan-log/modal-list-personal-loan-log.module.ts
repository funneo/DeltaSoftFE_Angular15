import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalListPersonalLoanLogComponent } from './modal-list-personal-loan-log.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';

@NgModule({
  declarations: [ModalListPersonalLoanLogComponent],
  imports: [
    CommonModule,
    ModalModule.forRoot(),
    AngularDraggableModule
  ],
  exports: [ModalListPersonalLoanLogComponent]
})
export class ModalListPersonalLoanLogModule { }
