import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SummarySupplierCostComponent } from './summary-supplier-cost.component';

const routes: Routes = [{
  path: '',
  component: SummarySupplierCostComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SummarySupplierCostRoutingModule { }
