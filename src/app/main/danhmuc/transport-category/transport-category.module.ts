import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransportCategoryRoutingModule } from './transport-category-routing.module';
import { TransportCategoryComponent } from './transport-category.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalTransportCategoryModule } from '@app/shared/components/danhmuc/modal-transport-category/modal-transport-category.module';


@NgModule({
  declarations: [TransportCategoryComponent],
  imports: [
    CommonModule,
    TransportCategoryRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalTransportCategoryModule
  ]
})
export class TransportCategoryModule { }
