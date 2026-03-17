import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { AdvanceRoutingModule } from './advance-routing.module';
import { ModalAdvanceModule } from '@app/shared/components/advance-payment/modal-advance/modal-advance.module';
import { AdvanceComponent } from './advance.component';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';

@NgModule({
  declarations: [AdvanceComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    AdvanceRoutingModule,
    ModalAdvanceModule,
    ModalPhieuChiModule,
    ModalPhieuThuModule,
    Daterangepicker
  ],
  providers:[
    DatePipe,
  ]
})
export class AdvanceModule { }
