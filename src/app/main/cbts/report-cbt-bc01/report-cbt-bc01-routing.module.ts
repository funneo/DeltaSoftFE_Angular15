import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportCbtBc01Component } from './report-cbt-bc01.component';

const routes: Routes = [{
  path:'',component:ReportCbtBc01Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportCbtBc01RoutingModule { }
