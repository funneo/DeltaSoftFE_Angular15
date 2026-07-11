import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgxMaskModule } from 'ngx-mask';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';

import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalConfirmDenyClosingFclModule } from '../modal-confirm-deny-closing-fcl/modal-confirm-deny-closing-fcl.module';
import { ModalViewShippingTaskModule } from '../modal-view-shipping-task/modal-view-shipping-task.module';

import { ModalExecuteFclComponent } from './modal-execute-fcl.component';

@NgModule({
  declarations: [ModalExecuteFclComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    AccordionModule.forRoot(),
    PipeSharedModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    Daterangepicker,
    ModalAttachfileModule,
    ModalConfirmDenyClosingFclModule,
    ModalViewShippingTaskModule,
  ],
  exports: [ModalExecuteFclComponent],
})
export class ModalExecuteFclModule { }
