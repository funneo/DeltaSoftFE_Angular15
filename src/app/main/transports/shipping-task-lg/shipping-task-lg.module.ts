import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ShippingTaskLgRoutingModule } from './shipping-task-lg-routing.module';
import { ShippingTaskLgComponent } from './shipping-task-lg.component';
import { FormsModule } from '@angular/forms';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalDispatchOrderFclModule } from '@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';
import { ModalShippingTaskCsModule } from '@app/shared/components/transports/modal-shipping-task-cs/modal-shipping-task-cs.module';
import { ModalShippingTaskOpmanModule } from '@app/shared/components/transports/modal-shipping-task-opman/modal-shipping-task-opman.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [ShippingTaskLgComponent],
  imports: [
    CommonModule,
    ShippingTaskLgRoutingModule,
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
  ],providers:[
    DatePipe
  ]
})
export class ShippingTaskLgModule { }
