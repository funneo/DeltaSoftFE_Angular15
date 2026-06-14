import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalOfficeAttendanceDetailComponent } from './modal-office-attendance-detail.component';

@NgModule({
  declarations: [ModalOfficeAttendanceDetailComponent],
  imports: [CommonModule, FormsModule, ModalModule, AngularDraggableModule],
  exports: [ModalOfficeAttendanceDetailComponent]
})
export class ModalOfficeAttendanceDetailModule { }
