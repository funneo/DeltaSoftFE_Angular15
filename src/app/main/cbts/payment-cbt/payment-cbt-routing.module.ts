import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentCbtComponent } from './payment-cbt.component';

const routes: Routes = [{
  path:'',component:PaymentCbtComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentCbtRoutingModule { }
