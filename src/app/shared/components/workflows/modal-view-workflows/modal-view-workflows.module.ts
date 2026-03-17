import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalViewWorkflowsComponent } from './modal-view-workflows.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalWorkflowAttackFilesModule } from '../modal-workflow-attack-files/modal-workflow-attack-files.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';



@NgModule({
  declarations: [ModalViewWorkflowsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    Daterangepicker,
    ModalWorkflowAttackFilesModule,
    ModalAttachfileModule
  ],
  exports:[ModalViewWorkflowsComponent]
})
export class ModalViewWorkflowsModule { }
