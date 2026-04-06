import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuotationCustomerComponent } from './quotation-customer.component';

const routes: Routes = [
  { path: '', component: QuotationCustomerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationCustomerRoutingModule { }
