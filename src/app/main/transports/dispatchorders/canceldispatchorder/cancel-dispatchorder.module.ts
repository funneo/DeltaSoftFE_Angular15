import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancelDispatchorderRoutingModule } from './cancel-dispatchorder-routing.module';
import { CancelDispatchorderComponent } from './cancel-dispatchorder.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalDispatchorderModule } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.module';
import { ModalCancelDispatchOrderApprovedModule } from '@app/shared/components/transports/modal-cancel-dispatch-order-approved/modal-cancel-dispatch-order-approved.module';


@NgModule({
  declarations: [CancelDispatchorderComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    CancelDispatchorderRoutingModule,
    ModalDispatchorderModule,
    ModalCancelDispatchOrderApprovedModule
  ]
})
export class CancelDispatchorderModule { }
