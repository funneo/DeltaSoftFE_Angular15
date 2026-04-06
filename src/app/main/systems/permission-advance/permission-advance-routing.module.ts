import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionAdvanceComponent } from './permission-advance.component';

const routes: Routes = [
  { path: '', component: PermissionAdvanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionAdvanceRoutingModule { }
