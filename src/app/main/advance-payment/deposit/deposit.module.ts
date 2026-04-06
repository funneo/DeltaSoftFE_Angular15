import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DepositComponent } from './deposit.component';
import { DepositRoutingModule } from './deposit-routing.module';
import { ModalDepositModule } from '@app/shared/components/advance-payment/modal-deposit/modal-deposit.module';


@NgModule({
  declarations: [DepositComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalDepositModule,
    Daterangepicker,
    DepositRoutingModule
  ]
})
export class DepositModule { }
