import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDispatchorderRouteComponent } from './modal-dispatchorder-route.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';



@NgModule({
  declarations: [ModalDispatchorderRouteComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
  ],
  exports:[ModalDispatchorderRouteComponent]
})
export class ModalDispatchorderRouteModule { }
