import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ReportCP03RoutingModule } from './report-cp03-routing.module';
import { ReportCp03Component } from './report-cp03.component';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';

@NgModule({
  declarations: [ReportCp03Component],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ReportCP03RoutingModule,
    Daterangepicker,
    ModalShipmentModule
  ]
})
export class ReportCp03Module { }
