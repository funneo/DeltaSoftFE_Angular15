import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChucnangComponent } from './chucnang.component';
import { ChucNangRoutingModule } from '../chucnang/chucnang-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalChucNangModule } from '@app/shared/components/systems/modal-chuc-nang/modal-chuc-nang.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ChucnangComponent],
  imports: [
    CommonModule,
    ChucNangRoutingModule,
    PaginationModule.forRoot(),
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    ModalChucNangModule,
    NgSelectModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),

  ]
})
export class ChucnangModule { }
