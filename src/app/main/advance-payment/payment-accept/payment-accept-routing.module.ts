import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentAcceptComponent } from './payment-accept.component';

const routes: Routes = [
  { path: '', component: PaymentAcceptComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentAcceptRoutingModule { }
