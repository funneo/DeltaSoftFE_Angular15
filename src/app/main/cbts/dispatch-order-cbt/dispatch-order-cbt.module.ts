import { ModalExternalOilPurchasedModule } from '@app/shared/components/transports/modal-external-oil-purchased/modal-external-oil-purchased.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DispatchOrderCbtRoutingModule } from './dispatch-order-cbt-routing.module';
import { DispatchOrderCbtComponent } from './dispatch-order-cbt.component';
import { ModalDispatchOrderCbtModule } from '@app/shared/components/cbt/modal-dispatch-order-cbt/modal-dispatch-order-cbt.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalAdvanceCbtModule } from '@app/shared/components/cbt/modal-advance-cbt/modal-advance-cbt.module';
import { ModalPaymentCbtModule } from '@app/shared/components/cbt/modal-payment-cbt/modal-payment-cbt.module';
import { ModalDriverFuelApprovalModule } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.module';


@NgModule({
  declarations: [DispatchOrderCbtComponent],
  imports: [
    CommonModule,
    DispatchOrderCbtRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalDispatchOrderCbtModule,
    NgxSpinnerModule,
    ModalAttachfileModule,
    ModalAdvanceCbtModule,
    ModalPaymentCbtModule,
    ModalDriverFuelApprovalModule,
    ModalExternalOilPurchasedModule
  ],
  providers:[
    DatePipe,
  ]
})
export class DispatchOrderCbtModule { }
