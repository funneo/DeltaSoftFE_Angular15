import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { FundComponent } from './fund.component';
import { FundRoutingModule } from './fund-routing.module';
import { ModalFundModule } from '@app/shared/components/accounting/modal-fund/modal-fund.module';

@NgModule({
  declarations: [FundComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    FundRoutingModule,
    ModalFundModule,
    Daterangepicker
  ]
})
export class FundModule { }
