import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalOpmanChangeWorkflowComponent } from './modal-opman-change-workflow.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';



@NgModule({
  declarations: [ModalOpmanChangeWorkflowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    Daterangepicker
  ],
  exports:[ModalOpmanChangeWorkflowComponent]
})
export class ModalOpmanChangeWorkflowModule { }
