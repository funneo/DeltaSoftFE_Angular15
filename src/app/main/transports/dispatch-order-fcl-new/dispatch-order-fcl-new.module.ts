import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DispatchOrderFclNewRoutingModule } from './dispatch-order-fcl-new-routing.module';
import { DispatchOrderFclNewComponent } from './dispatch-order-fcl-new.component';

import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxSpinnerModule } from 'ngx-spinner';

// CHỈ các modal cần thiết — KHÔNG import modal FCL legacy
import { ModalDispatchOrderFclV2Module } from '@app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.module';
import { ModalClosingFclProcessModule } from '@app/shared/components/transports/modal-closing-fcl-process/modal-closing-fcl-process.module';
import { ModalPhieuChiLenhModule } from '@app/shared/components/accounting/modal-phieu-chi-lenh/modal-phieu-chi-lenh.module';

@NgModule({
  declarations: [DispatchOrderFclNewComponent],
  imports: [
    CommonModule,
    DispatchOrderFclNewRoutingModule,
    FormsModule,
    PaginationModule,
    NgBusyModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    NgxSpinnerModule,
    ModalDispatchOrderFclV2Module,
    ModalClosingFclProcessModule,
    ModalPhieuChiLenhModule
  ],
  providers: [DatePipe]
})
export class DispatchOrderFclNewModule { }
