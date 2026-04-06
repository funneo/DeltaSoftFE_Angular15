import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportShipmentNotDebitComponent } from './report-shipment-not-debit.component';

const routes: Routes = [
  { path: '', component: ReportShipmentNotDebitComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportShipmentNotDebitRoutingModule { }
