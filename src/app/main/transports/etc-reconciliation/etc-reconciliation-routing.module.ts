import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EtcReconciliationComponent } from './etc-reconciliation.component';

const routes: Routes = [
  { path: '', component: EtcReconciliationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtcReconciliationRoutingModule { }
