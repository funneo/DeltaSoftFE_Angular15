import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentFeeComponent } from './payment-fee.component';

const routes: Routes = [
  { path: '', component: PaymentFeeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentFeeRoutingModule { }
