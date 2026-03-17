import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AdvanceCbtRoutingModule } from './advance-cbt-routing.module';
import { AdvanceCbtComponent } from './advance-cbt.component';
import { ModalAdvanceCbtModule } from '@app/shared/components/cbt/modal-advance-cbt/modal-advance-cbt.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';


@NgModule({
  declarations: [AdvanceCbtComponent],
  imports: [
    CommonModule,
    AdvanceCbtRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalAdvanceCbtModule,
    ModalPhieuChiModule,
    ModalPhieuThuModule,
    Daterangepicker
  ],
  providers:[
    DatePipe,
  ]
})
export class AdvanceCbtModule { }
