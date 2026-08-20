import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalFclClosingScopeComponent } from './modal-fcl-closing-scope.component';

@NgModule({
  declarations: [ModalFclClosingScopeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    AngularDraggableModule,
    NgSelectModule,
  ],
  exports: [ModalFclClosingScopeComponent]
})
export class ModalFclClosingScopeModule { }
