import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeDebitCreditComponent } from './employee-debit-credit.component';

const routes: Routes = [
  { path: '', component: EmployeeDebitCreditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class  EmployeeDebitCreditRoutingModule { }
