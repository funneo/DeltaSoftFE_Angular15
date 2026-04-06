import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionCsComponent } from './permission-cs.component';

const routes: Routes = [
  { path: '', component: PermissionCsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionCsRoutingModule { }
