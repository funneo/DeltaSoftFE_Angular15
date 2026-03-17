import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { ReportDebitnoteDetailRoutingModule } from './report-debitnote-detail-routing.module';
import { ReportDebitnoteDetailComponent } from './report-debitnote-detail.component';

@NgModule({
  declarations: [ReportDebitnoteDetailComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ReportDebitnoteDetailRoutingModule,
    Daterangepicker,
    ModalShipmentModule
  ]
})
export class ReportDebitnoteDetailModule { }
