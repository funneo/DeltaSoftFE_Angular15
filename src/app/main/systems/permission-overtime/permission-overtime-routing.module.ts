import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionOvertimeComponent } from './permission-overtime.component';

const routes: Routes = [
  {path: '', component: PermissionOvertimeComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionOvertimeRoutingModule { }
