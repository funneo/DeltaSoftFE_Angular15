import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportCp03FilterRoutingModule } from './report-cp03-filter-routing.module';
import { ReportCp03FilterComponent } from './report-cp03-filter.component';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [ReportCp03FilterComponent],
  imports: [
    CommonModule,
    ReportCp03FilterRoutingModule,
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
export class ReportCp03FilterModule { }
