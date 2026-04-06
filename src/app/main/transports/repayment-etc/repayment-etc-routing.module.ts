import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepaymentEtcComponent } from './repayment-etc.component';

const routes: Routes = [{
  path:'' ,component:RepaymentEtcComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepaymentEtcRoutingModule { }
