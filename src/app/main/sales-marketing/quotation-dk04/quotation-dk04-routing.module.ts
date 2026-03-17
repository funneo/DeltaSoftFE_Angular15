import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuotationDk04Component } from './quotation-dk04.component';

const routes: Routes = [{
  path:'',component:QuotationDk04Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationDk04RoutingModule { }
