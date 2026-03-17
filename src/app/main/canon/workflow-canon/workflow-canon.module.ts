import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowCanonRoutingModule } from './workflow-canon-routing.module';
import { WorkflowCanonComponent } from './workflow-canon.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { ModalJobCanonModule } from '@app/shared/components/canon/modal-job-canon/modal-job-canon.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { JobCanonRoutingModule } from '../job-canon/job-canon-routing.module';
import { ModalWorkflowCanonModule } from '@app/shared/components/canon/modal-workflow-canon/modal-workflow-canon.module';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { ModalWorkflowAttackFilesModule } from '@app/shared/components/workflows/modal-workflow-attack-files/modal-workflow-attack-files.module';


@NgModule({
  declarations: [WorkflowCanonComponent],
  imports: [
    CommonModule,
    WorkflowCanonRoutingModule,
    PaginationModule,
      NgBusyModule,
      FormsModule,
      SharedDirectivesModule,
      PipeSharedModule,
      NgSelectModule,
      Daterangepicker,
      ModalWorkflowCanonModule,
      ModalJobCanonModule,
      ModalWorkflowAttackFilesModule
  ]
})
export class WorkflowCanonModule { }
