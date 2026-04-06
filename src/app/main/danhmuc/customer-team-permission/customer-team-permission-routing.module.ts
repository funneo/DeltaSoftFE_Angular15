import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerTeamPermissionComponent } from './customer-team-permission.component';

const routes: Routes = [{
  path:'',component:CustomerTeamPermissionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerTeamPermissionRoutingModule { }
