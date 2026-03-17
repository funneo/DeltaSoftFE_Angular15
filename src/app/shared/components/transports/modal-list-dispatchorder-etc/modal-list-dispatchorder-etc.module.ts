import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalListDispatchorderEtcComponent } from './modal-list-dispatchorder-etc.component';
import { RouterModule } from '@angular/router';
import { ModalDispatchorderModule } from '../modal-dispatchorder/modal-dispatchorder.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [ModalListDispatchorderEtcComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    ModalDispatchorderModule,
    RouterModule
  ],exports:[ModalListDispatchorderEtcComponent]
})
export class ModalListDispatchorderEtcModule { }
