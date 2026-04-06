import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractExtensionRoutingModule } from './contract-extension-routing.module';
import { ContractExtensionComponent } from './contract-extension.component';
import { ModalContractCustomerModule } from '@app/shared/components/sales-marketing/modal-contract-customer/modal-contract-customer.module';
import { ContractCustomerRoutingModule } from '../contract-customer/contract-customer-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalContractExtensionModule } from '@app/shared/components/sales-marketing/modal-contract-extension/modal-contract-extension.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';


@NgModule({
  declarations: [ContractExtensionComponent],
  imports: [
    CommonModule,
    ContractExtensionRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalContractCustomerModule,
    ModalContractExtensionModule,
    ModalAttachfileModule
  ]
})
export class ContractExtensionModule { }
