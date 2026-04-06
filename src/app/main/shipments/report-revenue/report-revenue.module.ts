import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ReportRevenueComponent } from './report-revenue.component';
import { ReportRevenueRoutingModule } from './report-revenue-routing.module';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';

@NgModule({
  declarations: [ReportRevenueComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ReportRevenueRoutingModule,
    Daterangepicker,
    ModalShipmentModule
  ]
})
export class ReportRevenueModule { }
