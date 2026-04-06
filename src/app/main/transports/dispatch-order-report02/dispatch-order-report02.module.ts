import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DispatchOrderReport02RoutingModule } from './dispatch-order-report02-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalDriverFuelApprovalModule } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.module';
import { DispatchOrderReport02Component } from './dispatch-order-report02.component';


@NgModule({
  declarations: [DispatchOrderReport02Component],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalDriverFuelApprovalModule,
    DispatchOrderReport02RoutingModule
  ]
})
export class DispatchOrderReport02Module { }
