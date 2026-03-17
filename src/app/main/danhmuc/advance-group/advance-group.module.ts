import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdvanceGroupComponent } from './advance-group.component';
import { AdvanceGroupRoutingModule } from './advance-group-routing.module';
import { ModalAdvanceGroupModule } from '@app/shared/components/danhmuc/modal-advance-group/modal-advance-group.module';

@NgModule({
  declarations: [AdvanceGroupComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    AdvanceGroupRoutingModule,
    ModalAdvanceGroupModule
  ]
})
export class AdvanceGroupModule { }
