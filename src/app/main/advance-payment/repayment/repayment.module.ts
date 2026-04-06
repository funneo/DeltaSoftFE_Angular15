import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalRepaymentModule } from '@app/shared/components/advance-payment/modal-repayment/modal-repayment.module';
import { RepaymentComponent } from './repayment.component';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { RepaymentRoutingModule } from './repayment-routing.module';


@NgModule({
  declarations: [RepaymentComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalRepaymentModule,
    ModalPhieuThuModule,
    Daterangepicker,
    RepaymentRoutingModule
  ]
})
export class RepaymentModule { }
