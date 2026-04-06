import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OnleaveManagementComponent } from './onleave-management.component';

const routes: Routes = [
  {path: '', component:OnleaveManagementComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnleaveManagementRoutingModule { }
