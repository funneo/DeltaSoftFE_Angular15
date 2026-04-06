import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TollstationRoutingModule } from './tollstation-routing.module';
import { TollstationComponent } from './tollstation.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalTollstationModule } from '@app/shared/components/danhmuc/modal-tollstation/modal-tollstation.module';


@NgModule({
  declarations: [TollstationComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    TollstationRoutingModule,
    ModalTollstationModule
  ]
})
export class TollstationModule { }
