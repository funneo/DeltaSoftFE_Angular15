import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeeComponent } from './fee.component';
import { FeeRoutingModule } from './fee-routing.module';
import { ModalFeeModule } from '@app/shared/components/danhmuc/modal-fee/modal-fee.module';
import { ModalFeeCodeModule } from '@app/shared/components/danhmuc/modal-fee-code/modal-fee-code.module';

@NgModule({
  declarations: [FeeComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    FeeRoutingModule,
    ModalFeeModule,
    ModalFeeCodeModule
  ]
})
export class FeeModule { }
