import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShippingTaskCsComponent } from './shipping-task-cs.component';

const routes: Routes = [{
  path:'',component:ShippingTaskCsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingTaskCsRoutingModule { }
