import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDocHoaDonComponent } from './modal-doc-hoa-don.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ModalDocHoaDonComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    AngularDraggableModule,
  ],
  exports: [ModalDocHoaDonComponent]
})
export class ModalDocHoaDonModule { }
