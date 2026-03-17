import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountingDebitCreditDetailComponent } from './accounting-debit-credit-detail/accounting-debit-credit-detail.component';
import { AccountingDebitCreditComponent } from './accounting-debit-credit.component';


const routes: Routes = [
  { path: '', component: AccountingDebitCreditComponent },
  { path: 'detail/:id', component: AccountingDebitCreditDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingDebitCreditRoutingModule { }
