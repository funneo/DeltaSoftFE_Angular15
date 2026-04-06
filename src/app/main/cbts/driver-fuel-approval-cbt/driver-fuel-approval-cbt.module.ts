import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DriverFuelApprovalCbtRoutingModule } from './driver-fuel-approval-cbt-routing.module';
import { DriverFuelApprovalCbtComponent } from './driver-fuel-approval-cbt.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalDriverFuelApprovalModule } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [DriverFuelApprovalCbtComponent],
  imports: [
    CommonModule,
    DriverFuelApprovalCbtRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalDriverFuelApprovalModule,
    NgxSpinnerModule
  ],
  providers:[
    DatePipe,
  ]
})
export class DriverFuelApprovalCbtModule { }
