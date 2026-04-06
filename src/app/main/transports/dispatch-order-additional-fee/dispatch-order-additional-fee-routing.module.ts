import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchOrderAdditionalFeeComponent } from './dispatch-order-additional-fee.component';

const routes: Routes = [{
  path: '', component:DispatchOrderAdditionalFeeComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchOrderAdditionalFeeRoutingModule { }
