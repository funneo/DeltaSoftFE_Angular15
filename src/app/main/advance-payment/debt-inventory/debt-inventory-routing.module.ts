import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DebtInventoryComponent } from './debt-inventory.component';

const routes: Routes = [
  { path: '', component: DebtInventoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebtInventoryRoutingModule { }
