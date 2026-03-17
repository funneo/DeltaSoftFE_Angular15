import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GasSiteRoutingModule } from './gas-site-routing.module';
import { GasSiteComponent } from './gas-site.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalGasSiteModule } from '@app/shared/components/danhmuc/modal-gas-site/modal-gas-site.module';


@NgModule({
  declarations: [GasSiteComponent],
  imports: [
    CommonModule,
    GasSiteRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalGasSiteModule
  ]
})
export class GasSiteModule { }
