import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DispatchOrderFclRoutingModule } from './dispatch-order-fcl-routing.module';
import { FormsModule } from '@angular/forms';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalDispatchOrderFclModule } from '@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';
import { ModalDispatchOrderFclV2Module } from '@app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.module';
import { DispatchOrderFclComponent } from './dispatch-order-fcl.component';
import { ModalPerformFclModule } from '@app/shared/components/transports/modal-perform-fcl/modal-perform-fcl.module';
import { ModalClosingFclProcessModule } from '@app/shared/components/transports/modal-closing-fcl-process/modal-closing-fcl-process.module';
import { ModalPhieuChiLenhModule } from '@app/shared/components/accounting/modal-phieu-chi-lenh/modal-phieu-chi-lenh.module';


@NgModule({
  declarations: [DispatchOrderFclComponent],
  imports: [
    CommonModule,
    DispatchOrderFclRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalWorkflowModule,
    Daterangepicker,
    NgxSpinnerModule,
    ModalDispatchOrderFclModule,
    ModalDispatchOrderFclV2Module,
    ModalPerformFclModule,
    ModalClosingFclProcessModule,
    ModalPhieuChiLenhModule
  ],
  providers: [
    DatePipe,
  ]
})
export class DispatchOrderFclModule { }
