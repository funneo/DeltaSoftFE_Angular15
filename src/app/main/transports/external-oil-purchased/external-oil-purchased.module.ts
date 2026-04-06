import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ExternalOilPurchasedRoutingModule } from './external-oil-purchased-routing.module';
import { ExternalOilPurchasedComponent } from './external-oil-purchased.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalExternalOilPurchasedModule } from '@app/shared/components/transports/modal-external-oil-purchased/modal-external-oil-purchased.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';


@NgModule({
  declarations: [ExternalOilPurchasedComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ExternalOilPurchasedRoutingModule,
    ModalExternalOilPurchasedModule,
    ModalPhieuChiModule,
    ModalPhieuThuModule
  ],
  providers: [
    DatePipe,
  ]
})
export class ExternalOilPurchasedModule { }
