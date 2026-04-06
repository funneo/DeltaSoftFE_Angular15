import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportBc04Dt12Component } from './report-bc04-dt12.component';

const routes: Routes = [{
  path:'',component:ReportBc04Dt12Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportBc04Dt12RoutingModule { }
