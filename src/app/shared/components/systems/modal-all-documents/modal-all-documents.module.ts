import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModalAllDocumentsComponent } from './modal-all-documents.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [ModalAllDocumentsComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
    TabsModule.forRoot(),
  ],exports:[ModalAllDocumentsComponent],
  providers: [DatePipe],
})
export class ModalAllDocumentsModule { }
