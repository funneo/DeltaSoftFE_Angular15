import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GasManagementRoutingModule } from './gas-management-routing.module';
import { GasManagementComponent } from './gas-management.component';
import { ModalGasManagementModule } from '@app/shared/components/transports/modal-gas-management/modal-gas-management.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [GasManagementComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalGasManagementModule,
    GasManagementRoutingModule
  ]
})
export class GasManagementModule { }
