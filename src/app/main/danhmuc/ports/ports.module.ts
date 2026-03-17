import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortsRoutingModule } from './ports-routing.module';
import { PortsComponent } from './ports.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalPortsModule } from '@app/shared/components/danhmuc/modal-ports/modal-ports.module';


@NgModule({
  declarations: [PortsComponent],
  imports: [
    CommonModule,
    PortsRoutingModule,
    PaginationModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalPortsModule
  ]
})
export class PortsModule { }
