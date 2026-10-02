import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { ModalGaragePaymentRequestModule } from '@app/shared/components/accounting/modal-garage-payment-request/modal-garage-payment-request.module';
import { GaragePaymentRequestRoutingModule } from './garage-payment-request-routing.module';
import { GaragePaymentRequestComponent } from './garage-payment-request.component';

@NgModule({
  declarations: [GaragePaymentRequestComponent],
  imports: [
    CommonModule,
    GaragePaymentRequestRoutingModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalGaragePaymentRequestModule,
    ModalPhieuChiModule,
    ModalPhieuThuModule
  ],
  providers: [
    DatePipe,
  ]
})
export class GaragePaymentRequestModule { }
