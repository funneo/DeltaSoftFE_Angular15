import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalEmployeeHrComponent } from './modal-employee-hr.component';

@NgModule({
  declarations: [ModalEmployeeHrComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    TabsModule.forRoot(),
    NgBusyModule,
    AngularDraggableModule,
    Daterangepicker,
    NgSelectModule,
    PipeSharedModule,
    ModalAttachfileModule
  ],
  exports: [ModalEmployeeHrComponent]
})
export class ModalEmployeeHrModule { }
