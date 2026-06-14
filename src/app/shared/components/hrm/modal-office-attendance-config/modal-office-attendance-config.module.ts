import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalOfficeAttendanceConfigComponent } from './modal-office-attendance-config.component';

@NgModule({
  declarations: [ModalOfficeAttendanceConfigComponent],
  imports: [CommonModule, FormsModule, ModalModule, AngularDraggableModule, NgSelectModule],
  exports: [ModalOfficeAttendanceConfigComponent]
})
export class ModalOfficeAttendanceConfigModule { }
