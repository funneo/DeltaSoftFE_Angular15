import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesCustomerRoutingModule } from './sales-customer-routing.module';
import { SalesCustomerComponent } from './sales-customer.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalSalesCustomerModule } from '@app/shared/components/sales-marketing/modal-sales-customer/modal-sales-customer.module';


@NgModule({
  declarations: [SalesCustomerComponent],
  imports: [
    CommonModule,
    SalesCustomerRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalSalesCustomerModule
  ]
})
export class SalesCustomerModule { }
