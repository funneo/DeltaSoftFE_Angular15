import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRequestNewEmployeeComponent } from './modal-request-new-employee.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';



@NgModule({
  declarations: [ModalRequestNewEmployeeComponent],
  imports: [
    CommonModule,
      FormsModule,
      ModalModule,
      NgBusyModule,
      AngularDraggableModule,
      Daterangepicker,
      PipeSharedModule,
      NgSelectModule,
  ],exports: [ModalRequestNewEmployeeComponent],
})
export class ModalRequestNewEmployeeModule { }
