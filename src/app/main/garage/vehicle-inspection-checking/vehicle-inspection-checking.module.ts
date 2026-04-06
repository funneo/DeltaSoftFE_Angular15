import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleInspectionCheckingRoutingModule } from './vehicle-inspection-checking-routing.module';
import { VehicleInspectionCheckingComponent } from './vehicle-inspection-checking.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalVehicleInspectionModule } from '@app/shared/components/garage/modal-vehicle-inspection/modal-vehicle-inspection.module';


@NgModule({
  declarations: [VehicleInspectionCheckingComponent],
  imports: [
    CommonModule,
    VehicleInspectionCheckingRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalVehicleInspectionModule
  ]
})
export class VehicleInspectionCheckingModule { }
