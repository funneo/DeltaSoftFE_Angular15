import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ReportDebitnoteDetailFilterRoutingModule } from './report-debitnote-detail-filter-routing.module';
import { ReportDebitnoteDetailFilterComponent } from './report-debitnote-detail-filter.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalDebitNotesModule } from '@app/shared/components/shipments/modal-debit-notes/modal-debit-notes.module';


@NgModule({
  declarations: [ReportDebitnoteDetailFilterComponent],
  imports: [
    CommonModule,
    ReportDebitnoteDetailFilterRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalShipmentModule,
    NgxSpinnerModule,
    ModalDebitNotesModule
  ],
  providers:[
    DatePipe,
  ]
})
export class ReportDebitnoteDetailFilterModule { }
