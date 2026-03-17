import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import {ModalCancelDispatchOrderApprovedComponent} from '@app/shared/components/transports/modal-cancel-dispatch-order-approved/modal-cancel-dispatch-order-approved.component'
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalDispatchorderRouteModule } from '../modal-dispatchorder-route/modal-dispatchorder-route.module';
import { ModalDispatchorderWorkflowModule } from '../modal-dispatchorder-workflow/modal-dispatchorder-workflow.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalDispatchorderTicketModule } from '../modal-dispatchorder-ticket/modal-dispatchorder-ticket.module';
import { ModalWorkflowModule } from '../../workflows/modal-workflow/modal-workflow.module';
import { ModalViewWorkflowsModule } from '../../workflows/modal-view-workflows/modal-view-workflows.module';



@NgModule({
  declarations: [ModalCancelDispatchOrderApprovedComponent],
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
  ],exports:[ModalCancelDispatchOrderApprovedComponent]
})
export class ModalCancelDispatchOrderApprovedModule { }
