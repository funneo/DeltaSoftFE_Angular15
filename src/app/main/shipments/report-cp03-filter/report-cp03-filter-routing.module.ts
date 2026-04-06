import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportCp03FilterComponent } from './report-cp03-filter.component';

const routes: Routes = [
  { path: '', component: ReportCp03FilterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportCp03FilterRoutingModule { }
