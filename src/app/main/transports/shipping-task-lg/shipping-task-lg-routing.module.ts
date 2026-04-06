import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShippingTaskLgComponent } from './shipping-task-lg.component';

const routes: Routes = [{
  path: '',component:ShippingTaskLgComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingTaskLgRoutingModule { }
