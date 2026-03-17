import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeLimitComponent } from './employee-limit.component';

const routes: Routes = [
  { path: '', component: EmployeeLimitComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeLimitRoutingModule { }
