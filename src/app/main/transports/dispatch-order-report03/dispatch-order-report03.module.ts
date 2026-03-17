import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DispatchOrderReport03RoutingModule } from './dispatch-order-report03-routing.module';
import { DispatchOrderReport03Component } from './dispatch-order-report03.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { Daterangepicker } from 'ng2-daterangepicker';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalDispatchorderModule } from '@app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalDispatchOrderFclModule } from '@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';


@NgModule({
  declarations: [DispatchOrderReport03Component],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    ModalDispatchorderModule,
    ModalDispatchOrderFclModule,
    DispatchOrderReport03RoutingModule,
    NgxSpinnerModule,
    TabsModule.forRoot(),
  ],
  providers:[
    DatePipe,
  ]
})
export class DispatchOrderReport03Module { }
