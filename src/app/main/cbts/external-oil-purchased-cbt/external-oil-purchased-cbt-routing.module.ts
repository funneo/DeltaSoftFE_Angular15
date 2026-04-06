import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExternalOilPurchasedCbtComponent } from './external-oil-purchased-cbt.component';

const routes: Routes = [{
  path:'',component:ExternalOilPurchasedCbtComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExternalOilPurchasedCbtRoutingModule { }
