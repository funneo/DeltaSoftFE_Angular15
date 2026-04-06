import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { VehicleInspectionRoutingModule } from './vehicle-inspection-routing.module';
import { VehicleInspectionComponent } from './vehicle-inspection.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalVehicleInspectionModule } from '@app/shared/components/garage/modal-vehicle-inspection/modal-vehicle-inspection.module';


@NgModule({
  declarations: [VehicleInspectionComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalVehicleInspectionModule,
    VehicleInspectionRoutingModule
  ],
  providers:[
    DatePipe,
  ]
})
export class VehicleInspectionModule { }
