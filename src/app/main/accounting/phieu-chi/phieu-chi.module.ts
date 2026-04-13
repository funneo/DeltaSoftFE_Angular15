import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PhieuChiComponent } from './phieu-chi.component';
import { PhieuChiRoutingModule } from './phieu-chi-routing.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalPhieuChiMultiModule } from '@app/shared/components/accounting/modal-phieu-chi-multi/modal-phieu-chi-multi.module';
import { ModalPhieuChiLenhModule } from '@app/shared/components/accounting/modal-phieu-chi-lenh/modal-phieu-chi-lenh.module';

@NgModule({
  declarations: [PhieuChiComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PhieuChiRoutingModule,
    ModalPhieuChiModule,
    ModalPhieuChiMultiModule,
    ModalPhieuChiLenhModule,
    Daterangepicker
  ],
  providers: [
    DatePipe,
  ]
})
export class PhieuChiModule { }
