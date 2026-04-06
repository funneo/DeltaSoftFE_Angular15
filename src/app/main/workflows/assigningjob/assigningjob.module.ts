import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssigningjobRoutingModule } from './assigningjob-routing.module';
import { AssigningjobComponent } from './assigningjob.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalOpmanAssigningWorkflowModule } from '@app/shared/components/workflows/modal-opman-assigning-workflow/modal-opman-assigning-workflow.module';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { ModalOpmanChangeWorkflowModule } from '@app/shared/components/workflows/modal-opman-change-workflow/modal-opman-change-workflow.module';
import { ModalGradeWorkflowModule } from '@app/shared/components/workflows/modal-grade-workflow/modal-grade-workflow.module';
import { ModalWorkflowImagesModule } from '@app/shared/components/workflows/modal-workflow-images/modal-workflow-images.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [AssigningjobComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    AssigningjobRoutingModule,
    TabsModule.forRoot(),
    ModalOpmanAssigningWorkflowModule,
    ModalWorkflowModule,
    ModalOpmanChangeWorkflowModule,
    ModalGradeWorkflowModule,
    ModalWorkflowImagesModule,
    NgxSpinnerModule
  ]
})
export class AssigningjobModule { }
