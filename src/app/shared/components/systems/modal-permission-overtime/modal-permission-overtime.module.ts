import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPermissionOvertimeComponent } from './modal-permission-overtime.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';



@NgModule({
  declarations: [ModalPermissionOvertimeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
  ],
  exports:[ModalPermissionOvertimeComponent]
})
export class ModalPermissionOvertimeModule { }
