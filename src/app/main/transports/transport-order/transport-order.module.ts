import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransportOrderRoutingModule } from './transport-order-routing.module';
import { TransportOrderComponent } from './transport-order.component';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalTransportOrderModule } from '@app/shared/components/transports/modal-transport-order/modal-transport-order.module';

@NgModule({
  declarations: [TransportOrderComponent],
  imports: [
    CommonModule,
    FormsModule,
    TransportOrderRoutingModule,
    PaginationModule,
    NgSelectModule,
    NgxSpinnerModule,
    Daterangepicker,
    SharedDirectivesModule,
    PipeSharedModule,
    ModalTransportOrderModule,
  ],
  providers: [DatePipe]
})
export class TransportOrderModule { }
