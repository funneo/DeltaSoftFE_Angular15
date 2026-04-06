import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SublistCategoryRoutingModule } from './sublist-category-routing.module';
import { SublistCategoryComponent } from './sublist-category.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalSublistCategoryModule } from '@app/shared/components/sales-marketing/modal-sublist-category/modal-sublist-category.module';


@NgModule({
  declarations: [SublistCategoryComponent],
  imports: [
    CommonModule,
    SublistCategoryRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalSublistCategoryModule
  ]
})
export class SublistCategoryModule { }
