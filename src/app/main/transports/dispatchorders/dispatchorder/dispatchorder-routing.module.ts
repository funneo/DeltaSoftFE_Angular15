import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DispatchorderComponent } from './dispatchorder.component';

const routes: Routes = [
  { path: '', component: DispatchorderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchorderRoutingModule { }
