import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportTrainingDocumentsRoutingModule } from './report-training-documents-routing.module';
import { ReportTrainingDocumentsComponent } from './report-training-documents.component';
import { FormsModule } from '@angular/forms';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [ReportTrainingDocumentsComponent],
  imports: [
    CommonModule,
    PaginationModule,
      NgBusyModule,
      FormsModule,
      SharedDirectivesModule,
      PipeSharedModule,
      NgSelectModule,
      TabsModule.forRoot(),
      ModalWorkflowModule,
      Daterangepicker,
    ReportTrainingDocumentsRoutingModule
  ]
})
export class ReportTrainingDocumentsModule { }
