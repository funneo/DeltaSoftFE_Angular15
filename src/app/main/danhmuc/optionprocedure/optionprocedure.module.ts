import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptionprocedureRoutingModule } from './optionprocedure-routing.module';
import { OptionprocedureComponent } from './optionprocedure.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalOptionprocedureModule } from '@app/shared/components/danhmuc/modal-optionprocedure/modal-optionprocedure.module';


@NgModule({
  declarations: [OptionprocedureComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    OptionprocedureRoutingModule,
    ModalOptionprocedureModule
  ]
})
export class OptionprocedureModule { }
