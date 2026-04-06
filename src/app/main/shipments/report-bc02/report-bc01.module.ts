import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ReportBc01Component } from './report-bc01.component';
import { ReportBc01RoutingModule } from './report-bc01-routing.module';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [ReportBc01Component],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ReportBc01RoutingModule,
    Daterangepicker,
    ModalShipmentModule,
    NgxSpinnerModule
  ]
})
export class ReportBc01Module { }
