import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceCanonComponent } from './price-canon.component';

const routes: Routes = [
  { path: '', component: PriceCanonComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceCanonRoutingModule { }
