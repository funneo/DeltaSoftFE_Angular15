import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAttachfileComponent } from './modal-attachfile.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [ModalAttachfileComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
  ],
  exports:[ModalAttachfileComponent]
})
export class ModalAttachfileModule { }
