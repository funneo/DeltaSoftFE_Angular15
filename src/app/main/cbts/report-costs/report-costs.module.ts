import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportCostsRoutingModule } from './report-costs-routing.module';
import { ReportCostsComponent } from './report-costs.component';


@NgModule({
  declarations: [ReportCostsComponent],
  imports: [
    CommonModule,
    ReportCostsRoutingModule
  ]
})
export class ReportCostsModule { }
