import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalWorkflowComponent } from './modal-workflow.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { AppDaterangepickerModule } from '@app/shared/directives/daterangepicker/daterangepicker.module';
import { ModalWorkflowAttackFilesModule } from '../modal-workflow-attack-files/modal-workflow-attack-files.module';
import { ModalMultiplyWorkflowModule } from '../modal-multiply-workflow/modal-multiply-workflow.module';
import { ModalShipmentViewSearchModule } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';



@NgModule({
  declarations: [ModalWorkflowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    AppDaterangepickerModule,
    ModalWorkflowAttackFilesModule,
    ModalMultiplyWorkflowModule,
    ModalShipmentViewSearchModule,
    ModalAttachfileModule
  ],
  exports:[ModalWorkflowComponent]
})
export class ModalWorkflowModule { }
