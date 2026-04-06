import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverFuelLimitComponent } from './driver-fuel-limit.component';

const routes: Routes = [{
  path: '', component: DriverFuelLimitComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverFuelLimitRoutingModule { }
