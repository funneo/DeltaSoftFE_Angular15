import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchOrderReport03Component } from './dispatch-order-report03.component';

const routes: Routes = [
  { path: '', component: DispatchOrderReport03Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchOrderReport03RoutingModule { }
