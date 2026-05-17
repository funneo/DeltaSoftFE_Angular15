import { NgModule, Pipe } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ShippingTaskOpmanRoutingModule } from './shipping-task-opman-routing.module';
import { ShippingTaskOpmanComponent } from './shipping-task-opman.component';
import { FormsModule } from '@angular/forms';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalShippingTaskCsModule } from '@app/shared/components/transports/modal-shipping-task-cs/modal-shipping-task-cs.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalShippingTaskOpmanModule } from '@app/shared/components/transports/modal-shipping-task-opman/modal-shipping-task-opman.module';
import { ModalDispatchOrderFclModule } from '@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';
import { ModalDispatchOrderFclV2Module } from '@app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.module';
import { UtilityService } from '@app/shared/services';
import { NgxMaskModule } from 'ngx-mask';
import { ModalTransportOrderModule } from '@app/shared/components/transports/modal-transport-order/modal-transport-order.module';


@NgModule({
  declarations: [ShippingTaskOpmanComponent],
  imports: [
    CommonModule,
    ShippingTaskOpmanRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalShippingTaskOpmanModule,
    ModalShippingTaskCsModule,
    Daterangepicker,
    TabsModule.forRoot(),
    ModalAttachfileModule,
    NgxSpinnerModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalDispatchOrderFclModule,
    ModalDispatchOrderFclV2Module,
    ModalTransportOrderModule,
  ],providers:[
    DatePipe
  ]
})
export class ShippingTaskOpmanModule { }
