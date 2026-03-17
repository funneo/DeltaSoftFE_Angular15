import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportDebitnoteDetailComponent } from './report-debitnote-detail.component';

const routes: Routes = [
  { path: '', component: ReportDebitnoteDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportDebitnoteDetailRoutingModule { }
