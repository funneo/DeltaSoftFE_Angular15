import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VehicleInspectionCheckingComponent } from './vehicle-inspection-checking.component';

const routes: Routes = [{
  path:'',component:VehicleInspectionCheckingComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleInspectionCheckingRoutingModule { }
