import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepaymentComponent } from './repayment.component';

const routes: Routes = [
  { path: '', component: RepaymentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepaymentRoutingModule { }
