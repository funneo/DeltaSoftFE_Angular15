import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DebtReportComponent } from './debt-report.component';

const routes: Routes = [
  { path: '', component: DebtReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebtReportRoutingModule { }
