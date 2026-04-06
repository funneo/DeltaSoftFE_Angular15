import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShipmentNormalComponent } from './shipment-normal.component';

const routes: Routes = [{
  path:'',component:ShipmentNormalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShipmentNormalRoutingModule { }
