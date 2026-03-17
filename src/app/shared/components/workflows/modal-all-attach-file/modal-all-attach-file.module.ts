import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAllAttachFileComponent } from './modal-all-attach-file.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';



@NgModule({
  declarations: [ModalAllAttachFileComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
  ],exports:[ModalAllAttachFileComponent]
})
export class ModalAllAttachFileModule { }
