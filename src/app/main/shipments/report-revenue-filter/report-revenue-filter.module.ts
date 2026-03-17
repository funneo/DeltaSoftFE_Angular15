import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRevenueFilterRoutingModule } from './report-revenue-filter-routing.module';
import { ReportRevenueFilterComponent } from './report-revenue-filter.component';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [ReportRevenueFilterComponent],
  imports: [
    CommonModule,
    ReportRevenueFilterRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalShipmentModule,
    NgxSpinnerModule
  ]
})
export class ReportRevenueFilterModule { }
