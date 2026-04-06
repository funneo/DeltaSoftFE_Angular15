import { ReportStatementFilterComponent } from '@app/main/shipments/report-statement-filter/report-statement-filter.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: ReportStatementFilterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportStatementFilterRoutingModule { }
