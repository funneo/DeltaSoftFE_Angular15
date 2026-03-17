import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubcontractorsDispatchOrderComponent } from './subcontractors-dispatch-order.component';

const routes: Routes = [
  { path: '', component: SubcontractorsDispatchOrderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubcontractorsDispatchOrderRoutingModule { }
