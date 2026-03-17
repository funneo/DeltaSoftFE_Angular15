import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RateExchangeComponent } from './rate-exchange.component';

const routes: Routes = [{
  path:'',component:RateExchangeComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RateExchangeRoutingModule { }
