import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { RevenueFeeComponent } from './revenue-fee.component';
import { RevenueFeeRoutingModule } from './revenue-fee-routing.module';
import { ModalRevenueFeeModule } from '@app/shared/components/danhmuc/modal-revenue-fee/modal-revenue-fee.module';

@NgModule({
  declarations: [RevenueFeeComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    RevenueFeeRoutingModule,
    ModalRevenueFeeModule
  ]
})
export class RevenueFeeModule { }
