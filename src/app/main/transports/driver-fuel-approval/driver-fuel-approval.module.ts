import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DriverFuelApprovalRoutingModule } from './driver-fuel-approval-routing.module';
import { DriverFuelApprovalComponent } from './driver-fuel-approval.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalDriverFuelApprovalModule } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalFuelSummaryModule } from '@app/shared/components/transports/modal-fuel-summary/modal-fuel-summary.module';


@NgModule({
  declarations: [DriverFuelApprovalComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    DriverFuelApprovalRoutingModule,
    ModalDriverFuelApprovalModule,
    NgxSpinnerModule,
    ModalFuelSummaryModule
  ],
  providers:[
    DatePipe,
  ]
})
export class DriverFuelApprovalModule { }
