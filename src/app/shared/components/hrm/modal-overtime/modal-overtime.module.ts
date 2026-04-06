import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalOvertimeComponent } from './modal-overtime.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalSearchOpWorkflowModule } from '../../workflows/modal-search-op-workflow/modal-search-op-workflow.module';



@NgModule({
  declarations: [ModalOvertimeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    Daterangepicker,
    PipeSharedModule,
    ModalAttachfileModule,
    ModalSearchOpWorkflowModule
  ],
  exports:[ModalOvertimeComponent]
})
export class ModalOvertimeModule { }
