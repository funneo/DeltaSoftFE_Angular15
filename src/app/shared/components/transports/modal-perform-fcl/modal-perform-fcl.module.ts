import { ModalAttachfileModule } from './../../systems/modal-attachfile/modal-attachfile.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPerformFclComponent } from './modal-perform-fcl.component';
import { BarRatingModule } from 'ngx-bar-rating';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxMaskModule } from 'ngx-mask';
import { ModalConfirmDenyClosingFclModule } from '../modal-confirm-deny-closing-fcl/modal-confirm-deny-closing-fcl.module';
import { ModalShippingTaskCsModule } from '../modal-shipping-task-cs/modal-shipping-task-cs.module';
import { ModalViewShippingTaskModule } from '../modal-view-shipping-task/modal-view-shipping-task.module';



@NgModule({
  declarations: [ModalPerformFclComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    AccordionModule.forRoot(),
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    BarRatingModule,
    ModalAttachfileModule,
    ModalConfirmDenyClosingFclModule,
    ModalShippingTaskCsModule,
    ModalViewShippingTaskModule,
    ModalViewShippingTaskModule
  ],exports: [ModalPerformFclComponent]
})
export class ModalPerformFclModule {}
