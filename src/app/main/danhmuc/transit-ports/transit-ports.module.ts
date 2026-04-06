import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransitPortsRoutingModule } from './transit-ports-routing.module';
import { TransitPortsComponent } from './transit-ports.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalTransitPortsModule } from '@app/shared/components/danhmuc/modal-transit-ports/modal-transit-ports.module';


@NgModule({
  declarations: [TransitPortsComponent],
  imports: [
    CommonModule,
  PaginationModule,
      NgBusyModule,
      FormsModule,
      SharedDirectivesModule,
      PipeSharedModule,
      NgSelectModule,
    TransitPortsRoutingModule,
    ModalTransitPortsModule
  ]
})
export class TransitPortsModule { }
