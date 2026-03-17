import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverFuelClosingRoutingModule } from './driver-fuel-closing-routing.module';
import { DriverFuelClosingComponent } from './driver-fuel-closing.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { ModalDriverFuelClosingModule } from '@app/shared/components/transports/modal-driver-fuel-closing/modal-driver-fuel-closing.module';


@NgModule({
  declarations: [DriverFuelClosingComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    DriverFuelClosingRoutingModule,
    ModalDriverFuelClosingModule
  ]
})
export class DriverFuelClosingModule { }
