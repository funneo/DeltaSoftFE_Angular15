import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { QuotationDk04RoutingModule } from './quotation-dk04-routing.module';
import { QuotationDk04Component } from './quotation-dk04.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuotationCustomerRoutingModule } from '../quotation-customer/quotation-customer-routing.module';
import { ModalQuotationCustomerModule } from '@app/shared/components/sales-marketing/modal-quotation-customer/modal-quotation-customer.module';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';


@NgModule({
  declarations: [QuotationDk04Component],
  imports: [
    CommonModule,
    QuotationDk04RoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalQuotationCustomerModule,
    ModalAttachfileModule
  ],
  providers:[
    DatePipe,
  ]
})
export class QuotationDk04Module { }
