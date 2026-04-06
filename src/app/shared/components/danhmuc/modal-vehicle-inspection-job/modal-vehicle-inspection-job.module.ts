import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalVehicleInspectionJobComponent } from './modal-vehicle-inspection-job.component';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [ModalVehicleInspectionJobComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
  ],exports:[ModalVehicleInspectionJobComponent]
})
export class ModalVehicleInspectionJobModule { }
