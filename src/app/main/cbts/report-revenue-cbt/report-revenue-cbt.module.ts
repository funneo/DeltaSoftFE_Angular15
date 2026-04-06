import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRevenueCbtRoutingModule } from './report-revenue-cbt-routing.module';
import { ReportRevenueCbtComponent } from './report-revenue-cbt.component';


@NgModule({
  declarations: [ReportRevenueCbtComponent],
  imports: [
    CommonModule,
    ReportRevenueCbtRoutingModule
  ]
})
export class ReportRevenueCbtModule { }
