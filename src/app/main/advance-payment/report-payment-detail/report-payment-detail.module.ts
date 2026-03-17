import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ReportPaymentDetailComponent } from './report-payment-detail.component';
import { ReportPaymentDetailRoutingModule } from './report-payment-detail-routing.module';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalPaymentDetailModule } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.module';

@NgModule({
  declarations: [ReportPaymentDetailComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ReportPaymentDetailRoutingModule,
    Daterangepicker,
    NgxSpinnerModule,
    ModalShipmentModule,
    ModalPaymentDetailModule
  ],
  providers:[
    DatePipe,
  ]
})
export class ReportPaymentDetailModule { }
