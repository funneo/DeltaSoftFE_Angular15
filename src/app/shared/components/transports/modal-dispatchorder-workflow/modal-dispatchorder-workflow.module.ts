import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDispatchorderWorkflowComponent } from './modal-dispatchorder-workflow.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalSearchWorkflowModule } from '../../workflows/modal-search-workflow/modal-search-workflow.module';



@NgModule({
  declarations: [ModalDispatchorderWorkflowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    ModalSearchWorkflowModule
  ],
  exports:[ModalDispatchorderWorkflowComponent]
})
export class ModalDispatchorderWorkflowModule { }
