import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionTrainingDocumentRoutingModule } from './permission-training-document-routing.module';
import { PermissionTrainingDocumentComponent } from './permission-training-document.component';
import { ModalPermissionTrainingDocumentModule } from '@app/shared/components/systems/modal-permission-training-document/modal-permission-training-document.module';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';


@NgModule({
  declarations: [PermissionTrainingDocumentComponent],
  imports: [
    CommonModule,
      NgBusyModule,
      FormsModule,
      SharedDirectivesModule,
      PipeSharedModule,
      NgSelectModule,
    PermissionTrainingDocumentRoutingModule,
    ModalPermissionTrainingDocumentModule
  ]
})
export class PermissionTrainingDocumentModule { }
