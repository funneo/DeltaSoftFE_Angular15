import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalMatKhauComponent } from './modal-mat-khau.component';


@NgModule({
  declarations: [ModalMatKhauComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule
  ],
  exports: [ModalMatKhauComponent]
})
export class ModalMatKhauModule { }
