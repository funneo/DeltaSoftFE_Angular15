import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VehicleInspectionComponent } from './vehicle-inspection.component';

const routes: Routes = [
  { path: '', component: VehicleInspectionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleInspectionRoutingModule { }
