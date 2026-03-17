import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';
import { PaymentComponent } from './payment.component';

const routes: Routes = [
  { path: '', component: PaymentComponent },
  { path: 'detail', component: PaymentDetailComponent },
  { path: 'detail/:id', component: PaymentDetailComponent },
  { path: 'detail/:id/:flag', component: PaymentDetailComponent },
  { path: 'create/:type', component: PaymentDetailComponent },
  { path: 'create/:type/:wfId', component: PaymentDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule { }
