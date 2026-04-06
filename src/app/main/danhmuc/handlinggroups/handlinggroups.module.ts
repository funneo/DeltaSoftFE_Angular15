import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HandlinggroupsRoutingModule } from './handlinggroups-routing.module';
import { HandlinggroupsComponent } from './handlinggroups.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalHandlinggroupModule } from '@app/shared/components/danhmuc/modal-handlinggroup/modal-handlinggroup.module';


@NgModule({
  declarations: [HandlinggroupsComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    HandlinggroupsRoutingModule,
    ModalHandlinggroupModule
  ]
})
export class HandlinggroupsModule { }
