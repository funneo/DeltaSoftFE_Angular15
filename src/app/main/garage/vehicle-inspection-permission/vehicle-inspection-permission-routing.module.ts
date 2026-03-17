import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VehicleInspectionPermissionComponent } from './vehicle-inspection-permission.component';

const routes: Routes = [{
  path:'',component:VehicleInspectionPermissionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleInspectionPermissionRoutingModule { }
