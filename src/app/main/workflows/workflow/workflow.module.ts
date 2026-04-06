import { NgxSpinnerModule } from 'ngx-spinner';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowRoutingModule } from './workflow-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { WorkflowComponent } from './workflow.component';
import { ModalGradeWorkflowModule } from '@app/shared/components/workflows/modal-grade-workflow/modal-grade-workflow.module';
import { ModalWorkflowImagesModule } from '@app/shared/components/workflows/modal-workflow-images/modal-workflow-images.module';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [WorkflowComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalWorkflowModule,
    Daterangepicker,
    WorkflowRoutingModule,
    ModalWorkflowModule,
    ModalGradeWorkflowModule,
    ModalWorkflowImagesModule,
    NgxSpinnerModule,
    TabsModule.forRoot(),
  ]
})
export class WorkflowModule { }
