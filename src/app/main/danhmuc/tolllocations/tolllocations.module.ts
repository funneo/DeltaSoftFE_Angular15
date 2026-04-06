import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TolllocationsRoutingModule } from './tolllocations-routing.module';
import { TolllocationsComponent } from './tolllocations.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [TolllocationsComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    TolllocationsRoutingModule
  ]
})
export class TolllocationsModule { }
