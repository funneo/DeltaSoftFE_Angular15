import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteFuelClosingRoutingModule } from './site-fuel-closing-routing.module';
import { SiteFuelClosingComponent } from './site-fuel-closing.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalFuelClosingModule } from '@app/shared/components/transports/modal-fuel-closing/modal-fuel-closing.module';


@NgModule({
  declarations: [SiteFuelClosingComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalFuelClosingModule,
    SiteFuelClosingRoutingModule
  ]
})
export class SiteFuelClosingModule { }
