import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeHrComponent } from './employee-hr.component';

const routes: Routes = [{ path: '', component: EmployeeHrComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeHrRoutingModule { }
