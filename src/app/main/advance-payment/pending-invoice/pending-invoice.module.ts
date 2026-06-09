import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { Daterangepicker } from 'ng2-daterangepicker';

import { PendingInvoiceRoutingModule } from './pending-invoice-routing.module';
import { PendingInvoiceComponent } from './pending-invoice.component';
import { ModalDocHoaDonModule } from '@app/shared/components/advance-payment/modal-doc-hoa-don/modal-doc-hoa-don.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';

@NgModule({
  declarations: [PendingInvoiceComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgBusyModule,
    PaginationModule,
    Daterangepicker,
    PendingInvoiceRoutingModule,
    ModalDocHoaDonModule,
    PipeSharedModule,
    SharedDirectivesModule,
  ],
})
export class PendingInvoiceModule { }
