import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PotentialCustomerComponent } from './potential-customer.component';

const routes: Routes = [
  { path: '', component: PotentialCustomerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PotentialCustomerRoutingModule { }
