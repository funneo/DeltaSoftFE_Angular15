import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalWorkflowAttackFilesComponent } from './modal-workflow-attack-files.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';



@NgModule({
  declarations: [ModalWorkflowAttackFilesComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
  ],
  exports:[ModalWorkflowAttackFilesComponent]
})
export class ModalWorkflowAttackFilesModule { }
