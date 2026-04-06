import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistrictRoutingModule } from './district-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalDistrictModule } from '@app/shared/components/danhmuc/modal-district/modal-district.module';
import { DistrictComponent } from './district.component';


@NgModule({
  declarations: [DistrictComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    DistrictRoutingModule,
    ModalDistrictModule
  ]
})
export class DistrictModule { }
