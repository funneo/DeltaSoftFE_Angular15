import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentAcceptStep1RoutingModule } from './payment-accept-step1-routing.module';
import { PaymentAcceptStep1Component } from './payment-accept-step1.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [PaymentAcceptStep1Component],
  imports: [
    CommonModule,
    PaymentAcceptStep1RoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalShipmentModule,
    ModalAttachfileModule,
    ModalPhieuChiModule,
    NgxSpinnerModule,
    ModalPhieuThuModule
  ]
})
export class PaymentAcceptStep1Module { }
