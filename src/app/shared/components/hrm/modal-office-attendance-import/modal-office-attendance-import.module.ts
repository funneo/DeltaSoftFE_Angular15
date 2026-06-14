import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalOfficeAttendanceImportComponent } from './modal-office-attendance-import.component';

@NgModule({
  declarations: [ModalOfficeAttendanceImportComponent],
  imports: [CommonModule, FormsModule, ModalModule, AngularDraggableModule, NgSelectModule],
  exports: [ModalOfficeAttendanceImportComponent]
})
export class ModalOfficeAttendanceImportModule { }
