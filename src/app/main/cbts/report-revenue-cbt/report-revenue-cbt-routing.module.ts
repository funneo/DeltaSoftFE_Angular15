import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportRevenueCbtComponent } from './report-revenue-cbt.component';

const routes: Routes = [{
  path:'',component:ReportRevenueCbtComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRevenueCbtRoutingModule { }
