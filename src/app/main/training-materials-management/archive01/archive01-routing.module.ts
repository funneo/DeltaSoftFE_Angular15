import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Archive01Component } from './archive01.component';

const routes: Routes = [{
  path: '',component:Archive01Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Archive01RoutingModule { }
