import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSubcontractorDispatchOrderComponent } from './modal-subcontractor-dispatch-order.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgxMaskModule } from 'ngx-mask';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { BarRatingModule } from 'ngx-bar-rating';
import { UtilityService } from '@app/shared/services';
import { ModalDispatchorderTicketModule } from '../modal-dispatchorder-ticket/modal-dispatchorder-ticket.module';
import { ModalDispatchorderEtcModule } from '../modal-dispatchorder-etc/modal-dispatchorder-etc.module';
import { ModalDispatchorderParkingTicketModule } from '../modal-dispatchorder-parking-ticket/modal-dispatchorder-parking-ticket.module';



@NgModule({
  declarations: [ModalSubcontractorDispatchOrderComponent],
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
    ModalDispatchorderTicketModule,
    ModalDispatchorderEtcModule,
    ModalDispatchorderParkingTicketModule,

  ],exports:[ModalSubcontractorDispatchOrderComponent]
})
export class ModalSubcontractorDispatchOrderModule { }
