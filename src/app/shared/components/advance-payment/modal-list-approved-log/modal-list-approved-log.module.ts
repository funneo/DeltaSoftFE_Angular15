import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalListApprovedLogComponent } from './modal-list-approved-log.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';



@NgModule({
  declarations: [ModalListApprovedLogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
  ],exports:[ModalListApprovedLogComponent]
})
export class ModalListApprovedLogModule { }
