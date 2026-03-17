import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportBc01Component } from './report-bc01.component';

const routes: Routes = [
  { path: '', component: ReportBc01Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportBc01RoutingModule { }
