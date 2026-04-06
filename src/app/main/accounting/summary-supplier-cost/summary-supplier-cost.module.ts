import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { SummarySupplierCostRoutingModule } from './summary-supplier-cost-routing.module';
import { SummarySupplierCostComponent } from './summary-supplier-cost.component';
import { ModalSummarySupplierCostModule } from '@app/shared/components/accounting/modal-summary-supplier-cost/modal-summary-supplier-cost.module';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';


@NgModule({
  declarations: [SummarySupplierCostComponent],
  imports: [
    CommonModule,
    SummarySupplierCostRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalSummarySupplierCostModule,
    ModalPhieuChiModule
  ],
  providers: [
     DatePipe,
  ]
})
export class SummarySupplierCostModule {}
