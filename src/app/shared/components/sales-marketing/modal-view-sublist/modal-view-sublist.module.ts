import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalViewSublistComponent } from './modal-view-sublist.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [ModalViewSublistComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
  ],exports: [ModalViewSublistComponent]
})
export class ModalViewSublistModule { }
