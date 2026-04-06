import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobgroupRoutingModule } from './jobgroup-routing.module';
import { JobgroupComponent } from './jobgroup.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalJobgroupModule } from '@app/shared/components/danhmuc/modal-jobgroup/modal-jobgroup.module';


@NgModule({
  declarations: [JobgroupComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    JobgroupRoutingModule,
    ModalJobgroupModule,
  ]
})
export class JobgroupModule { }
