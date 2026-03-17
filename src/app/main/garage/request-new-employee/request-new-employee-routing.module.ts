import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestNewEmployeeComponent } from './request-new-employee.component';

const routes: Routes = [{
  path: '',component: RequestNewEmployeeComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestNewEmployeeRoutingModule { }
