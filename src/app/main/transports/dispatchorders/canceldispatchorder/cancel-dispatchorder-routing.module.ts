import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CancelDispatchorderComponent } from './cancel-dispatchorder.component';

const routes: Routes = [
  { path: '', component: CancelDispatchorderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CancelDispatchorderRoutingModule { }
