import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportPaymentDetailComponent } from './report-payment-detail.component';

const routes: Routes = [
  { path: '', component: ReportPaymentDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportPaymentDetailRoutingModule { }
