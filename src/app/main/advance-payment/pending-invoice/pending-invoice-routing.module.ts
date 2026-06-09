import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendingInvoiceComponent } from './pending-invoice.component';

const routes: Routes = [
  { path: '', component: PendingInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingInvoiceRoutingModule { }
