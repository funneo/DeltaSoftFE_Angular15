import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalWorkflowImagesComponent } from './modal-workflow-images.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [ModalWorkflowImagesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
  ],
  exports:[ModalWorkflowImagesComponent]
})
export class ModalWorkflowImagesModule { }
