import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvinceRoutingModule } from './province-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProvinceComponent } from './province.component';
import { ModalProvinceModule } from '@app/shared/components/danhmuc/modal-province/modal-province.module';


@NgModule({
  declarations: [ProvinceComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ProvinceRoutingModule,
    ModalProvinceModule
  ]
})
export class ProvinceModule { }
