import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { GroupFeeComponent } from './group-fee.component';
import { GroupFeeRoutingModule } from './group-fee-routing.module';
import { ModalGroupFeeModule } from '@app/shared/components/danhmuc/modal-group-fee/modal-group-fee.module';
import { ModalDebitNoteZeroModule } from '@app/shared/components/systems/modal-debit-note-zero/modal-debit-note-zero.module';

@NgModule({
  declarations: [GroupFeeComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    GroupFeeRoutingModule,
    ModalGroupFeeModule,
    ModalDebitNoteZeroModule
  ]
})
export class GroupFeeModule { }
