import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentAcceptStep1Component } from './payment-accept-step1.component';

const routes: Routes = [{
  path:'',component:PaymentAcceptStep1Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentAcceptStep1RoutingModule { }
