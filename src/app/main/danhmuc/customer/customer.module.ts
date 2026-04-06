import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerComponent } from './customer.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { ModalCustomerModule } from '@app/shared/components/danhmuc/modal-customer/modal-customer.module';
import { TabsModule } from 'ngx-bootstrap/tabs';

@NgModule({
  declarations: [CustomerComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    CustomerRoutingModule,
    ModalCustomerModule,
    TabsModule.forRoot(),
  ]
})
export class CustomerModule { }
