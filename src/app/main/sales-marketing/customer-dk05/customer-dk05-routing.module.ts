import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerDk05Component } from './customer-dk05.component';

const routes: Routes = [{
  path:'',component:CustomerDk05Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerDk05RoutingModule { }
