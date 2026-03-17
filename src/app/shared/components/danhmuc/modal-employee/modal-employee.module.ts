import { ModalAttachfileModule } from './../../systems/modal-attachfile/modal-attachfile.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalEmployeeComponent } from './modal-employee.component';
import { Daterangepicker } from 'ng2-daterangepicker';

@NgModule({
  declarations: [ModalEmployeeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    Daterangepicker,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    ModalAttachfileModule
   ],
   exports: [ModalEmployeeComponent]
})
export class ModalEmployeeModule { }
