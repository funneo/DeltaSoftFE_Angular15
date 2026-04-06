import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExternalOilPurchasedComponent } from './external-oil-purchased.component';

const routes: Routes = [{
  path: '', component: ExternalOilPurchasedComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExternalOilPurchasedRoutingModule { }
