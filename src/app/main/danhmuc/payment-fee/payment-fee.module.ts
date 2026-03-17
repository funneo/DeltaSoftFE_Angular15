import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaymentFeeComponent } from './payment-fee.component';
import { ModalPaymentFeeModule } from '@app/shared/components/danhmuc/modal-payment-fee/modal-payment-fee.module';
import { PaymentFeeRoutingModule } from './payment-fee-routing.module';

@NgModule({
  declarations: [PaymentFeeComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PaymentFeeRoutingModule,
    ModalPaymentFeeModule
  ]
})
export class PaymentFeeModule { }
