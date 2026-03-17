import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverFuelLimitComponent } from './driver-fuel-limit.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalDriverFuelApprovalComponent } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.component';
import { ModalDriverFuelLimitModule } from '@app/shared/components/transports/modal-driver-fuel-limit/modal-driver-fuel-limit.module';
import { DriverFuelLimitRoutingModule } from './driver-fuel-limit-routing.module';



@NgModule({
  declarations: [DriverFuelLimitComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    DriverFuelLimitRoutingModule,
    ModalDriverFuelLimitModule
  ]
})
export class DriverFuelLimitModule { }
