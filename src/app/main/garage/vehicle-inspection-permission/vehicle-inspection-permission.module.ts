import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleInspectionPermissionRoutingModule } from './vehicle-inspection-permission-routing.module';
import { VehicleInspectionPermissionComponent } from './vehicle-inspection-permission.component';
import { ModalVehicleInspectionPermissionModule } from '@app/shared/components/garage/modal-vehicle-inspection-permission/modal-vehicle-inspection-permission.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [VehicleInspectionPermissionComponent],
  imports: [
    CommonModule,
    VehicleInspectionPermissionRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalVehicleInspectionPermissionModule
  ]
})
export class VehicleInspectionPermissionModule { }
