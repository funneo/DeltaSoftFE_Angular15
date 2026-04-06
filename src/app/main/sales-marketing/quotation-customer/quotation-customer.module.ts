import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuotationCustomerRoutingModule } from './quotation-customer-routing.module';
import { ModalQuotationCustomerModule } from '@app/shared/components/sales-marketing/modal-quotation-customer/modal-quotation-customer.module';
import { QuotationCustomerComponent } from './quotation-customer.component';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalDigitizationQuotationCustomerModule } from '@app/shared/components/sales-marketing/modal-digitization-quotation-customer/modal-digitization-quotation-customer.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [QuotationCustomerComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    QuotationCustomerRoutingModule,
    ModalQuotationCustomerModule,
    ModalAttachfileModule,
    ModalDigitizationQuotationCustomerModule,
    NgxSpinnerModule
  ],
  providers:[
    DatePipe,
  ]
})
export class QuotationCustomerModule { }
