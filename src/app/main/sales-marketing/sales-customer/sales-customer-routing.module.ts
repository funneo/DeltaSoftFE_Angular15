import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesCustomerComponent } from './sales-customer.component';

const routes: Routes = [{
  path:'',component:SalesCustomerComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesCustomerRoutingModule { }
