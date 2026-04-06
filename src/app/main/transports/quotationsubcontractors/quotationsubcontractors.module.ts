import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuotationsubcontractorsRoutingModule } from './quotationsubcontractors-routing.module';
import { QuotationsubcontractorsComponent } from './quotationsubcontractors.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalQuotationsubcontractorsModule } from '@app/shared/components/transports/modal-quotationsubcontractors/modal-quotationsubcontractors.module';


@NgModule({
  declarations: [QuotationsubcontractorsComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    QuotationsubcontractorsRoutingModule,
    ModalQuotationsubcontractorsModule
  ]
})
export class QuotationsubcontractorsModule { }
