import { ReportDebitnoteDetailFilterComponent } from './report-debitnote-detail-filter.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: ReportDebitnoteDetailFilterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportDebitnoteDetailFilterRoutingModule { }
