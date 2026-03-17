import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OpenShipmentComponent } from './open-shipment.component';

const routes: Routes = [
  { path: '', component: OpenShipmentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpenShipmentRoutingModule { }
