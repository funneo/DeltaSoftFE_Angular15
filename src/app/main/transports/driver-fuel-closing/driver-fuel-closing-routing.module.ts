import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverFuelClosingComponent } from './driver-fuel-closing.component';

const routes: Routes = [{
  path: '', component: DriverFuelClosingComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverFuelClosingRoutingModule { }
