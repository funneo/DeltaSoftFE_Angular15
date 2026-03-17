import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExportInvoiceComponent } from './export-invoice.component';

const routes: Routes = [
  { path: '', component: ExportInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExportInvoiceRoutingModule { }
