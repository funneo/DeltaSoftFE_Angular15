import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PhieuThuRoutingModule } from './phieu-thu-routing.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { PhieuThuComponent } from './phieu-thu.component';

@NgModule({
  declarations: [PhieuThuComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PhieuThuRoutingModule,
    ModalPhieuThuModule,
    Daterangepicker
  ],
  providers:[
    DatePipe,
  ]
})
export class PhieuThuModule { }
