import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerformDispatchOrderComponent } from './perform-dispatch-order.component';

const routes: Routes = [
  { path: '', component: PerformDispatchOrderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerformDispatchOrderRoutingModule { }
