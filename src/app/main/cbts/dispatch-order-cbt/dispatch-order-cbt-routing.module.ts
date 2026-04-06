import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchOrderCbtComponent } from './dispatch-order-cbt.component';

const routes: Routes = [{
  path:'',component:DispatchOrderCbtComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchOrderCbtRoutingModule { }
