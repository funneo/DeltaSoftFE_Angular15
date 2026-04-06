import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobgroupoptionRoutingModule } from './jobgroupoption-routing.module';
import { JobgroupoptionComponent } from './jobgroupoption.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalJobgroupoptionModule } from '@app/shared/components/danhmuc/modal-jobgroupoption/modal-jobgroupoption.module';


@NgModule({
  declarations: [JobgroupoptionComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    JobgroupoptionRoutingModule,
    ModalJobgroupoptionModule
  ]
})
export class JobgroupoptionModule { }
