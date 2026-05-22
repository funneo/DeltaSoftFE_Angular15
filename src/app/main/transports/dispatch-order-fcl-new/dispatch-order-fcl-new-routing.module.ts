import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchOrderFclNewComponent } from './dispatch-order-fcl-new.component';

const routes: Routes = [
  { path: '', component: DispatchOrderFclNewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchOrderFclNewRoutingModule { }
