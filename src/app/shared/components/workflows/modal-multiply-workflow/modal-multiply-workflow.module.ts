import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalMultiplyWorkflowComponent } from './modal-multiply-workflow.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [ModalMultiplyWorkflowComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
  ],exports:[ModalMultiplyWorkflowComponent]
})
export class ModalMultiplyWorkflowModule { }
