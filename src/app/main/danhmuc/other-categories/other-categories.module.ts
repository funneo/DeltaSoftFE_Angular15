import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { OtherCategoriesComponent } from './other-categories.component';
import { OtherCategoriesRoutingModule } from './other-categories-routing.module';
import { ModalOtherCategoriesModule } from '@app/shared/components/danhmuc/modal-other-categories/modal-other-categories.module';

@NgModule({
  declarations: [OtherCategoriesComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    OtherCategoriesRoutingModule,
    ModalOtherCategoriesModule
  ]
})
export class OtherCategoriesModule { }
