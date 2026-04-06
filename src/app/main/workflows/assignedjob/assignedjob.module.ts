import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignedjobRoutingModule } from './assignedjob-routing.module';
import { AssignedjobComponent } from './assignedjob.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalOpWorkflowModule } from '@app/shared/components/workflows/modal-op-workflow/modal-op-workflow.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalWorkflowAttackFilesModule } from '@app/shared/components/workflows/modal-workflow-attack-files/modal-workflow-attack-files.module';
import { ModalViewWorkflowsModule } from '@app/shared/components/workflows/modal-view-workflows/modal-view-workflows.module';



@NgModule({
  declarations: [AssignedjobComponent],
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
    TabsModule.forRoot(),
    AssignedjobRoutingModule,
    ModalOpWorkflowModule,
    ModalViewWorkflowsModule,
    ModalWorkflowAttackFilesModule
  ]
})
export class AssignedjobModule { }
