import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShippingTaskOpmanComponent } from './shipping-task-opman.component';

const routes: Routes = [{
  path:'',component:ShippingTaskOpmanComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingTaskOpmanRoutingModule { }
