import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListTrainingDocumentsRoutingModule } from './list-training-documents-routing.module';
import { ListTrainingDocumentsComponent } from './list-training-documents.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalTrainingDocumentModule } from '@app/shared/components/hrm/modal-training-document/modal-training-document.module';
import { ModalViewScopeModule } from '@app/shared/components/hrm/modal-view-scope/modal-view-scope.module';


@NgModule({
  declarations: [ListTrainingDocumentsComponent],
  imports: [
    CommonModule,
    ListTrainingDocumentsRoutingModule,
        PaginationModule,
        NgBusyModule,
        FormsModule,
        SharedDirectivesModule,
        Daterangepicker,
        PipeSharedModule,
        NgSelectModule,
        ModalTrainingDocumentModule,
        ModalViewScopeModule
  ]
})
export class ListTrainingDocumentsModule { }
