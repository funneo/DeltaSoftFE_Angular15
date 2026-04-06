import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ContractCustomerRoutingModule } from './contract-customer-routing.module';
import { ModalContractCustomerModule } from '@app/shared/components/sales-marketing/modal-contract-customer/modal-contract-customer.module';
import { ContractCustomerComponent } from './contract-customer.component';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';

@NgModule({
  declarations: [ContractCustomerComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ContractCustomerRoutingModule,
    ModalContractCustomerModule,
    ModalAttachfileModule
  ]
})
export class ContractCustomerModule { }
