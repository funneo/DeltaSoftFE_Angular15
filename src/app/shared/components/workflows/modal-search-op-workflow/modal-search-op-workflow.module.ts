import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSearchOpWorkflowComponent } from './modal-search-op-workflow.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalViewWorkflowsModule } from '../modal-view-workflows/modal-view-workflows.module';



@NgModule({
  declarations: [ModalSearchOpWorkflowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    ModalViewWorkflowsModule
  ],exports:[ModalSearchOpWorkflowComponent]
})
export class ModalSearchOpWorkflowModule { }
