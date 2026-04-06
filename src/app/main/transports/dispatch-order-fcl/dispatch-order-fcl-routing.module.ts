import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchOrderFclComponent } from './dispatch-order-fcl.component';

const routes: Routes = [{
  path: '',component:DispatchOrderFclComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchOrderFclRoutingModule { }
