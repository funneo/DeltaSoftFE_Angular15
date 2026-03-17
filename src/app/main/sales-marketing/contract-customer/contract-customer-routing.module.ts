import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractCustomerComponent } from './contract-customer.component';

const routes: Routes = [
  { path: '', component: ContractCustomerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractCustomerRoutingModule { }
