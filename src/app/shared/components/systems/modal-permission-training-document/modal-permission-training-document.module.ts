import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPermissionTrainingDocumentComponent } from './modal-permission-training-document.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [ModalPermissionTrainingDocumentComponent],
  imports: [
    CommonModule,
      FormsModule,
      ModalModule,
      NgBusyModule,
      AngularDraggableModule,
      NgSelectModule,
      PipeSharedModule,
  ],exports: [ModalPermissionTrainingDocumentComponent],
})
export class ModalPermissionTrainingDocumentModule { }
