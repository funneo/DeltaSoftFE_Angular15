import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportCp03Component } from './report-cp03.component';

const routes: Routes = [
  { path: '', component: ReportCp03Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportCP03RoutingModule { }
