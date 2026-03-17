import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverFuelApprovalComponent } from './driver-fuel-approval.component';

const routes: Routes = [{
  path: '', component: DriverFuelApprovalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverFuelApprovalRoutingModule { }
