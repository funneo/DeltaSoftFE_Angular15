import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerDk05RoutingModule } from './customer-dk05-routing.module';
import { CustomerDk05Component } from './customer-dk05.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalQuotationCustomerModule } from '@app/shared/components/sales-marketing/modal-quotation-customer/modal-quotation-customer.module';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalSalesCustomerModule } from '@app/shared/components/sales-marketing/modal-sales-customer/modal-sales-customer.module';


@NgModule({
  declarations: [CustomerDk05Component],
  imports: [
    CommonModule,
    CustomerDk05RoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalSalesCustomerModule
  ]
})
export class CustomerDk05Module { }
