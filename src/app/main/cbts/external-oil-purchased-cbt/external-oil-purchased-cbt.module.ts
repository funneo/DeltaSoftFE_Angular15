import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ExternalOilPurchasedCbtRoutingModule } from './external-oil-purchased-cbt-routing.module';
import { ExternalOilPurchasedCbtComponent } from './external-oil-purchased-cbt.component';
import { ModalExternalOilPurchasedModule } from '@app/shared/components/transports/modal-external-oil-purchased/modal-external-oil-purchased.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';


@NgModule({
  declarations: [ExternalOilPurchasedCbtComponent],
  imports: [
    CommonModule,
    ExternalOilPurchasedCbtRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalExternalOilPurchasedModule,
    ModalPhieuChiModule,
    ModalPhieuThuModule
  ],
  providers: [
    DatePipe,
  ]
})
export class ExternalOilPurchasedCbtModule { }
