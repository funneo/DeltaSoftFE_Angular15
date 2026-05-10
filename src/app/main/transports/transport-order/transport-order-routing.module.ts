import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransportOrderComponent } from './transport-order.component';

const routes: Routes = [
  { path: '', component: TransportOrderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportOrderRoutingModule { }
