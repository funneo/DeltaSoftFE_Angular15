import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportBc04Dt12RoutingModule } from './report-bc04-dt12-routing.module';
import { ReportBc04Dt12Component } from './report-bc04-dt12.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [ReportBc04Dt12Component],
  imports: [
    CommonModule,
    ReportBc04Dt12RoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    NgxSpinnerModule,
    TabsModule.forRoot(),
  ]
})
export class ReportBc04Dt12Module { }
