import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PerformDispatchOrderRoutingModule } from './perform-dispatch-order-routing.module';
import { PerformDispatchOrderComponent } from './perform-dispatch-order.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalPerformDispatchOrderModule } from '@app/shared/components/transports/modal-perform-dispatch-order/modal-perform-dispatch-order.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalPerformFclModule } from '@app/shared/components/transports/modal-perform-fcl/modal-perform-fcl.module';


@NgModule({
  declarations: [PerformDispatchOrderComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    TabsModule.forRoot(),
    ModalWorkflowModule,
    Daterangepicker,
    PerformDispatchOrderRoutingModule,
    ModalPerformDispatchOrderModule,
    ModalPerformFclModule
  ],
    providers:[
      DatePipe,
    ]
})
export class PerformDispatchOrderModule { }
