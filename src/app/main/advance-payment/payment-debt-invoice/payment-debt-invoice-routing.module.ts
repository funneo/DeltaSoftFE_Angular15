import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentDebtInvoiceComponent } from './payment-debt-invoice.component';

const routes: Routes = [{
  path:'',component:PaymentDebtInvoiceComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentDebtInvoiceRoutingModule { }
