import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DebtSupplierComponent } from './debt-supplier.component';

const routes: Routes = [
  { path: '', component: DebtSupplierComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebtSupplierRoutingModule { }
