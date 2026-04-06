import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportProfitRoutingModule } from './report-profit-routing.module';
import { ReportProfitComponent } from './report-profit.component';


@NgModule({
  declarations: [ReportProfitComponent],
  imports: [
    CommonModule,
    ReportProfitRoutingModule
  ]
})
export class ReportProfitModule { }
