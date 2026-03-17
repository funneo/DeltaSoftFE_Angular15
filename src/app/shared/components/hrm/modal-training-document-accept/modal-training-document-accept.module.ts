import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTrainingDocumentAcceptComponent } from './modal-training-document-accept.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ModalTrainingDocumentAcceptComponent],
  imports: [
    CommonModule,
        FormsModule,
        ModalModule,
        AngularDraggableModule,
        NgSelectModule,
        NgxMaskModule.forRoot(UtilityService.maskConfig),
        PipeSharedModule,
  ],
  exports: [ModalTrainingDocumentAcceptComponent]
})
export class ModalTrainingDocumentAcceptModule { }
