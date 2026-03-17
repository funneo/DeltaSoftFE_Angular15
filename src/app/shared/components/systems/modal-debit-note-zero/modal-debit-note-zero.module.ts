import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDebitNoteZeroComponent } from './modal-debit-note-zero.component';
import { FormsModule } from '@angular/forms';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [ModalDebitNoteZeroComponent],
  imports: [
    CommonModule,    
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
    
  ],exports:[ModalDebitNoteZeroComponent]
})
export class ModalDebitNoteZeroModule { }
