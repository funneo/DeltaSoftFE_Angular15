import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalUserComponent } from './modal-user.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [ModalUserComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
  ],
  exports: [ModalUserComponent]
})
export class ModalUserModule { }
