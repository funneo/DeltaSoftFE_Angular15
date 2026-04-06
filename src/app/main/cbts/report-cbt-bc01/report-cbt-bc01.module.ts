import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportCbtBc01RoutingModule } from './report-cbt-bc01-routing.module';
import { ReportCbtBc01Component } from './report-cbt-bc01.component';
import { FormsModule } from '@angular/forms';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalPaymentCbtModule } from '@app/shared/components/cbt/modal-payment-cbt/modal-payment-cbt.module';
import { ModalExternalOilPurchasedModule } from '@app/shared/components/transports/modal-external-oil-purchased/modal-external-oil-purchased.module';
import { ModalDriverFuelApprovalModule } from '@app/shared/components/transports/modal-driver-fuel-approval/modal-driver-fuel-approval.module';


@NgModule({
  declarations: [ReportCbtBc01Component],
  imports: [
    CommonModule,
    ReportCbtBc01RoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalShipmentModule,
    NgxSpinnerModule,
    ModalPaymentCbtModule,
    ModalExternalOilPurchasedModule,
    ModalDriverFuelApprovalModule
  ]
})
export class ReportCbtBc01Module { }
