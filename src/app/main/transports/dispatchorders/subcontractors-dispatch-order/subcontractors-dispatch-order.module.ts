import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { SubcontractorsDispatchOrderRoutingModule } from './subcontractors-dispatch-order-routing.module';
import { SubcontractorsDispatchOrderComponent } from './subcontractors-dispatch-order.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalWorkflowModule } from '@app/shared/components/workflows/modal-workflow/modal-workflow.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalSubcontractorDispatchOrderModule } from '@app/shared/components/transports/modal-subcontractor-dispatch-order/modal-subcontractor-dispatch-order.module';


@NgModule({
  declarations: [SubcontractorsDispatchOrderComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalWorkflowModule,
    Daterangepicker,
    ModalSubcontractorDispatchOrderModule,
    SubcontractorsDispatchOrderRoutingModule
  ],
  providers:[
    DatePipe,
  ]
})
export class SubcontractorsDispatchOrderModule { }
