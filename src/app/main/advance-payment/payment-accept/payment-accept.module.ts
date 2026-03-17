import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaymentAcceptRoutingModule } from './payment-accept-routing.module';
import { PaymentAcceptComponent } from './payment-accept.component';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { ModalPhieuChiMultiModule } from '@app/shared/components/accounting/modal-phieu-chi-multi/modal-phieu-chi-multi.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [PaymentAcceptComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    PaymentAcceptRoutingModule,
    ModalShipmentModule,
    ModalAttachfileModule,
    ModalPhieuChiModule,
    ModalPhieuThuModule,
    NgxSpinnerModule,
    ModalPhieuChiMultiModule
  ]
})
export class PaymentAcceptModule { }
