import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportProfitComponent } from './report-profit.component';

const routes: Routes = [{
  path:'',component:ReportProfitComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportProfitRoutingModule { }
