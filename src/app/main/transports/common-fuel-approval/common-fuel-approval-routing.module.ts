import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonFuelApprovalComponent } from './common-fuel-approval.component';

const routes: Routes = [{
  path: '', component: CommonFuelApprovalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonFuelApprovalRoutingModule { }
