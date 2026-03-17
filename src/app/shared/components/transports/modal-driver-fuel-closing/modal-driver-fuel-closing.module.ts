import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDriverFuelClosingComponent } from './modal-driver-fuel-closing.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [ModalDriverFuelClosingComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule
  ],exports:[ModalDriverFuelClosingComponent]
})
export class ModalDriverFuelClosingModule { }
