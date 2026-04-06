import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchOrderReport02Component } from './dispatch-order-report02.component';

const routes: Routes = [
  { path: '', component: DispatchOrderReport02Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchOrderReport02RoutingModule { }
