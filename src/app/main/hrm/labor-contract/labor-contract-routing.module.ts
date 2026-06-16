import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LaborContractComponent } from './labor-contract.component';

const routes: Routes = [{ path: '', component: LaborContractComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaborContractRoutingModule { }
