import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Archive01RoutingModule } from './archive01-routing.module';
import { Archive01Component } from './archive01.component';
import { FormsModule } from '@angular/forms';
import { ModalTrainingDocumentModule } from '@app/shared/components/hrm/modal-training-document/modal-training-document.module';
import { ModalViewScopeModule } from '@app/shared/components/hrm/modal-view-scope/modal-view-scope.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [Archive01Component],
  imports: [
    CommonModule,
    Archive01RoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ModalTrainingDocumentModule,
    ModalViewScopeModule,
    TabsModule.forRoot(),  
  ]
})
export class Archive01Module { }
