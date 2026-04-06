import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ExportInvoiceRoutingModule } from './export-invoice-routing.module';
import { ModalExportInvoiceModule } from '@app/shared/components/accounting/modal-export-invoice/modal-export-invoice.module';
import { ExportInvoiceComponent } from './export-invoice.component';

@NgModule({
  declarations: [ExportInvoiceComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ExportInvoiceRoutingModule,
    ModalExportInvoiceModule,
    Daterangepicker
  ],
  providers:[
    DatePipe,
  ]
})
export class ExportInvoiceModule { }
