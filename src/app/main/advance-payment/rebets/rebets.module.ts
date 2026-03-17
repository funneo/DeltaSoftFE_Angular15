import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { RebetsComponent } from './rebets.component';
import { ModalRebetsModule } from '@app/shared/components/advance-payment/modal-rebets/modal-rebets.module';
import { RebetsRoutingModule } from './rebets-routing.module';


@NgModule({
  declarations: [RebetsComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalRebetsModule,
    ModalPhieuThuModule,
    Daterangepicker,
    RebetsRoutingModule
  ]
})
export class RebetsModule { }
