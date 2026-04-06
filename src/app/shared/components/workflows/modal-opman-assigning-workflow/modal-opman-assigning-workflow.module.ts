import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalOpmanAssigningWorkflowComponent } from './modal-opman-assigning-workflow.component';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';



@NgModule({
  declarations: [ModalOpmanAssigningWorkflowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
  ],
  exports:[ModalOpmanAssigningWorkflowComponent]
})
export class ModalOpmanAssigningWorkflowModule { }
