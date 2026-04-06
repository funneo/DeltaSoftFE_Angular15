import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchOrderReport01Component } from './dispatch-order-report01.component';

const routes: Routes = [
  { path: '', component: DispatchOrderReport01Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchOrderReport01RoutingModule { }
