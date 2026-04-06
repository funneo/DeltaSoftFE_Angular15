import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportRevenueComponent } from './report-revenue.component';

const routes: Routes = [
  { path: '', component: ReportRevenueComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRevenueRoutingModule { }
