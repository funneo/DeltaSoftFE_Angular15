import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccountListRoutingModule } from './account-list-routing.module';
import { AccountListComponent } from './account-list.component';
import { ModalAccountListModule } from '@app/shared/components/danhmuc/modal-account-list/modal-account-list.module';

@NgModule({
  declarations: [AccountListComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    AccountListRoutingModule,
    ModalAccountListModule
  ]
})
export class AccountListModule { }
