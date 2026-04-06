import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTrainingDocumentComponent } from './modal-training-document.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { EditorModule } from '@tinymce/tinymce-angular';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalTrainingDocumentAssigmentsModule } from '../modal-training-document-assigments/modal-training-document-assigments.module';
import { ModalTrainingDocumentAcceptModule } from '../modal-training-document-accept/modal-training-document-accept.module';




@NgModule({
  declarations: [ModalTrainingDocumentComponent],
  imports: [
    CommonModule,
    FormsModule,
      ModalModule,
      AngularDraggableModule,
      TabsModule.forRoot(),
      NgSelectModule,
      PipeSharedModule,
      EditorModule,
      ModalAttachfileModule,
      ModalTrainingDocumentAssigmentsModule,
      ModalTrainingDocumentAcceptModule
  ],
  exports: [ModalTrainingDocumentComponent],
})
export class ModalTrainingDocumentModule { }
