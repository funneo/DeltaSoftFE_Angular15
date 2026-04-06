import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepaymentEtcRoutingModule } from './repayment-etc-routing.module';
import { RepaymentEtcComponent } from './repayment-etc.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalRepaymentEtcModule } from '@app/shared/components/transports/modal-repayment-etc/modal-repayment-etc.module';

@NgModule({
  declarations: [RepaymentEtcComponent],
  imports: [
    CommonModule,
    RepaymentEtcRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalRepaymentEtcModule
  ]
})
export class RepaymentEtcModule { }
