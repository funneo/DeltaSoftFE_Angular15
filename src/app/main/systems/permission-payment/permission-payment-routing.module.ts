import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionPaymentComponent } from './permission-payment.component';

const routes: Routes = [
  { path: '', component: PermissionPaymentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionPaymentRoutingModule { }
