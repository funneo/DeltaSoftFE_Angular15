import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DebtComponent } from './debt.component';
import { DebtRoutingModule } from './debt-routing.module';
import { ModalDebtModule } from '@app/shared/components/accounting/modal-debt/modal-debt.module';

@NgModule({
  declarations: [DebtComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    DebtRoutingModule,
    ModalDebtModule,
    Daterangepicker
  ],
  providers:[
    DatePipe,
  ]
})
export class DebtModule { }
