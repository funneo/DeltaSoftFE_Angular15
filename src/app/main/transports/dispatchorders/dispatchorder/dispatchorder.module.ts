import { ModalDispatchOrderAdditionalFeeModule } from './../../../../shared/components/transports/modal-dispatch-order-additional-fee/modal-dispatch-order-additional-fee.module';
import { ModalChangedDriverModule } from '@app/shared/components/transports/modal-changed-driver/modal-changed-driver.module';
import { ModalPhieuChiLenhModule } from '@app/shared/components/accounting/modal-phieu-chi-lenh/modal-phieu-chi-lenh.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DispatchorderRoutingModule } from './dispatchorder-routing.module';
import { DispatchorderComponent } from './dispatchorder.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalDispatchorderModule } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.module';
import { ModalViewWorkflowsModule } from '@app/shared/components/workflows/modal-view-workflows/modal-view-workflows.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [DispatchorderComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalWorkflowModule,
    Daterangepicker,
    DispatchorderRoutingModule,
    ModalDispatchorderModule,
    ModalViewWorkflowsModule,
    ModalChangedDriverModule,
    ModalDispatchOrderAdditionalFeeModule,
    NgxSpinnerModule,
    ModalPhieuChiLenhModule
  ],
  providers: [
    DatePipe,
  ]
})
export class DispatchorderModule { }
