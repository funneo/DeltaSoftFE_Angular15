import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GaragePaymentRequestComponent } from './garage-payment-request.component';

const routes: Routes = [{
  path: '',
  component: GaragePaymentRequestComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GaragePaymentRequestRoutingModule { }
