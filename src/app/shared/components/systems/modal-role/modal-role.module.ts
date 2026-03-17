import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRoleComponent } from './modal-role.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';

@NgModule({
  declarations: [ModalRoleComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    NgBusyModule,
    AngularDraggableModule
  ],
  exports: [ModalRoleComponent]
})
export class ModalRoleModule { }
