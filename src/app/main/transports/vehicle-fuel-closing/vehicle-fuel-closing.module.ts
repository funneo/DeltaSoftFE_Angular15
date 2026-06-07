import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalVehicleFuelClosingModule } from '@app/shared/components/transports/modal-vehicle-fuel-closing/modal-vehicle-fuel-closing.module';

import { VehicleFuelClosingRoutingModule } from './vehicle-fuel-closing-routing.module';
import { VehicleFuelClosingComponent } from './vehicle-fuel-closing.component';

@NgModule({
  declarations: [VehicleFuelClosingComponent],
  imports: [
    CommonModule,
    FormsModule,
    PaginationModule,
    NgBusyModule,
    NgSelectModule,
    Daterangepicker,
    PipeSharedModule,
    SharedDirectivesModule,
    VehicleFuelClosingRoutingModule,
    ModalVehicleFuelClosingModule
  ],
  providers: [DatePipe]
})
export class VehicleFuelClosingModule {}
