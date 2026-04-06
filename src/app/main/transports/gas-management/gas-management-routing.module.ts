import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GasManagementComponent } from './gas-management.component';

const routes: Routes = [{
  path: '', component:GasManagementComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GasManagementRoutingModule { }
