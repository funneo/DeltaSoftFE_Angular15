import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationSubCanonComponent } from './quotation-sub-canon.component';
import { QuotationSubCanonRoutingModule } from './quotation-sub-canon-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalCanonQuotationsubcontractorsModule } from '@app/shared/components/canon/modal-canon-quotationsubcontractors/modal-canon-quotationsubcontractors.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Daterangepicker } from 'ng2-daterangepicker';

@NgModule({
  declarations: [QuotationSubCanonComponent],
  imports: [
    CommonModule,
    FormsModule,
    QuotationSubCanonRoutingModule,
    PaginationModule.forRoot(),
    ModalCanonQuotationsubcontractorsModule,
    NgSelectModule,
    PipeSharedModule,
    ModalModule.forRoot(),
    Daterangepicker
  ]
})
export class QuotationSubCanonModule { }
