import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeDebitClosingComponent } from './employee-debit-closing.component';

const routes: Routes = [{
  path:'',component:EmployeeDebitClosingComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeDebitClosingRoutingModule { }
