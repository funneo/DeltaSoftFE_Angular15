import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { RateExchangeRoutingModule } from './rate-exchange-routing.module';
import { RateExchangeComponent } from './rate-exchange.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';


@NgModule({
  declarations: [RateExchangeComponent],
  imports: [
    CommonModule,
    RateExchangeRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker
  ],
  providers:[
    DatePipe,
  ]
})
export class RateExchangeModule { }
