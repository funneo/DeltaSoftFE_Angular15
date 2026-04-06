import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PaymentCbtRoutingModule } from './payment-cbt-routing.module';
import { PaymentCbtComponent } from './payment-cbt.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalPaymentCbtModule } from '@app/shared/components/cbt/modal-payment-cbt/modal-payment-cbt.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';


@NgModule({
  declarations: [PaymentCbtComponent],
  imports: [
    CommonModule,
    PaymentCbtRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalPaymentCbtModule,
    Daterangepicker,
    ModalAttachfileModule
  ],
  providers:[
    DatePipe,
  ]
})
export class PaymentCbtModule { }
