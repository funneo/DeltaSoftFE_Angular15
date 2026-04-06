import { ModalDispatchOrderAdditionalFeeModule } from './../../../shared/components/transports/modal-dispatch-order-additional-fee/modal-dispatch-order-additional-fee.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DispatchOrderAdditionalFeeRoutingModule } from './dispatch-order-additional-fee-routing.module';
import { DispatchOrderAdditionalFeeComponent } from './dispatch-order-additional-fee.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalDispatchorderModule } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.module';


@NgModule({
  declarations: [DispatchOrderAdditionalFeeComponent],
  imports: [
    CommonModule,
    DispatchOrderAdditionalFeeRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalDispatchorderModule,
    ModalDispatchOrderAdditionalFeeModule
  ]
})
export class DispatchOrderAdditionalFeeModule { }
