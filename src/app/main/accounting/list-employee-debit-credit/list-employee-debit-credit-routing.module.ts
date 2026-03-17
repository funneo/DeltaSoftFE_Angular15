import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListEmployeeDebitCreditComponent } from './list-employee-debit-credit.component';

const routes: Routes = [{
  path:'',component:ListEmployeeDebitCreditComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListEmployeeDebitCreditRoutingModule { }
