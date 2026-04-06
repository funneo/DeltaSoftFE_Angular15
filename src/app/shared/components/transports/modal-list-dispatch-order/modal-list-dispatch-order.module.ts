import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalListDispatchOrderComponent } from './modal-list-dispatch-order.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { RouterModule } from '@angular/router';
import { ModalDispatchorderModule } from '../modal-dispatchorder/modal-dispatchorder.module';
import { ModalDispatchOrderFclModule } from '../modal-dispatch-order-fcl/modal-dispatch-order-fcl.module';



@NgModule({
  declarations: [ModalListDispatchOrderComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    ModalDispatchorderModule,
    ModalDispatchOrderFclModule,
    RouterModule
  ],exports:[ModalListDispatchOrderComponent]
})
export class ModalListDispatchOrderModule { }
