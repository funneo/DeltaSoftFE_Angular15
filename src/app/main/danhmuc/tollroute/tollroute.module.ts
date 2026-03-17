import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TollrouteRoutingModule } from './tollroute-routing.module';
import { TollrouteComponent } from './tollroute.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalTollrouteModule } from '@app/shared/components/danhmuc/modal-tollroute/modal-tollroute.module';


@NgModule({
  declarations: [TollrouteComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    TollrouteRoutingModule,
    ModalTollrouteModule
  ]
})
export class TollrouteModule { }
