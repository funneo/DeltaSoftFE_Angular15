import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PotentialCustomerComponent } from './potential-customer.component';
import { PotentialCustomerRoutingModule } from './potential-customer-routing.module';
import { ModalPotentialCustomerModule } from '@app/shared/components/sales-marketing/modal-potential-customer/modal-potential-customer.module';
import { ModalSalesCustomerModule } from '@app/shared/components/sales-marketing/modal-sales-customer/modal-sales-customer.module';
// import { ModalCustomerModule } from '@app/shared/components/danhmuc/modal-customer/modal-customer.module';

@NgModule({
  declarations: [PotentialCustomerComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalSalesCustomerModule,
    PotentialCustomerRoutingModule,
  ]
})
export class PotentialCustomerModule { }
