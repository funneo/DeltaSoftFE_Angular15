import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverFuelApprovalCbtComponent } from './driver-fuel-approval-cbt.component';

const routes: Routes = [{
  path:'',component:DriverFuelApprovalCbtComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverFuelApprovalCbtRoutingModule { }
