import { ModalVehicleInspectionJobModule } from './../../../shared/components/danhmuc/modal-vehicle-inspection-job/modal-vehicle-inspection-job.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleInspectionJobRoutingModule } from './vehicle-inspection-job-routing.module';
import { VehicleInspectionJobComponent } from './vehicle-inspection-job.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';


@NgModule({
  declarations: [VehicleInspectionJobComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    VehicleInspectionJobRoutingModule,
    ModalVehicleInspectionJobModule
  ]
})
export class VehicleInspectionJobModule { }
