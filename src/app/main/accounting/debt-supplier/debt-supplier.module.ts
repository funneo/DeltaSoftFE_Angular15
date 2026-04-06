import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalDebtModule } from '@app/shared/components/accounting/modal-debt/modal-debt.module';
import { DebtSupplierComponent } from './debt-supplier.component';
import { DebtSupplierRoutingModule } from './debt-supplier-routing.module';

@NgModule({
  declarations: [DebtSupplierComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    DebtSupplierRoutingModule,
    ModalDebtModule,
    Daterangepicker
  ],
  providers:[
    DatePipe,
  ]
})
export class DebtSupplierModule { }
