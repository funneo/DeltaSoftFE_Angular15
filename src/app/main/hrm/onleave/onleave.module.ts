import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnleaveRoutingModule } from './onleave-routing.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalOnleaveModule } from '@app/shared/components/hrm/modal-onleave/modal-onleave.module';
import { OnleaveComponent } from './onleave.component';


@NgModule({
  declarations: [OnleaveComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    OnleaveRoutingModule,
    ModalOnleaveModule
  ]
})
export class OnleaveModule { }
