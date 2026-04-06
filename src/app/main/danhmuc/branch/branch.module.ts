import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { BranchComponent } from './branch.component';
import { BranchRoutingModule } from './branch-routing.module';
import { ModalBranchModule } from '@app/shared/components/danhmuc/modal-branch/modal-branch.module';

@NgModule({
  declarations: [BranchComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    BranchRoutingModule,
    ModalBranchModule
  ]
})
export class BranchModule { }
