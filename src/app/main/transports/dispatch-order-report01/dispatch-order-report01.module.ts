import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DispatchOrderReport01RoutingModule } from './dispatch-order-report01-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DispatchOrderReport01Component } from './dispatch-order-report01.component';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [DispatchOrderReport01Component],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    DispatchOrderReport01RoutingModule,
    NgxSpinnerModule
  ]
})
export class DispatchOrderReport01Module { }
