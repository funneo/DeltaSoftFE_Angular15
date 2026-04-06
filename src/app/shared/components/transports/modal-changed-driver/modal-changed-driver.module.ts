import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalChangedDriverComponent } from './modal-changed-driver.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';



@NgModule({
  declarations: [ModalChangedDriverComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule
  ],exports:[ModalChangedDriverComponent]
})
export class ModalChangedDriverModule { }
