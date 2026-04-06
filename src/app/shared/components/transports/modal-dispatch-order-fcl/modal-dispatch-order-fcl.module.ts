import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDispatchOrderFclComponent } from './modal-dispatch-order-fcl.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { BarRatingModule } from 'ngx-bar-rating';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxMaskModule } from 'ngx-mask';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalCustomerRoutesModule } from '../../danhmuc/modal-customer-routes/modal-customer-routes.module';
import { ModalListShippingTaskModule } from '../modal-list-shipping-task/modal-list-shipping-task.module';
import { ModalShippingTaskCsModule } from '../modal-shipping-task-cs/modal-shipping-task-cs.module';
import { ModalViewShippingTaskModule } from '../modal-view-shipping-task/modal-view-shipping-task.module';
import { ModalShippingTaskAttachFileModule } from '../modal-shipping-task-attach-file/modal-shipping-task-attach-file.module';

@NgModule({
  declarations: [ModalDispatchOrderFclComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    Daterangepicker,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalAttachfileModule,
    BarRatingModule,
    ModalCustomerRoutesModule,
    ModalListShippingTaskModule,
    ModalShippingTaskCsModule,
    ModalViewShippingTaskModule,
    ModalShippingTaskAttachFileModule
  ],
  exports:[ModalDispatchOrderFclComponent]
})
export class ModalDispatchOrderFclModule { }
