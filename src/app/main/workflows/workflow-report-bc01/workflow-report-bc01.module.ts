import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkflowReportBc01RoutingModule } from './workflow-report-bc01-routing.module';
import { WorkflowReportBc01Component } from './workflow-report-bc01.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [WorkflowReportBc01Component],
  imports: [
    CommonModule,
    WorkflowReportBc01RoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    NgxSpinnerModule,
    Daterangepicker
  ]
})
export class WorkflowReportBc01Module { }
