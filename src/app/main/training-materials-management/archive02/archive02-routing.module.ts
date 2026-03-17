import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Archive02Component } from './archive02.component';

const routes: Routes = [{
  path: '',component:Archive02Component
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Archive02RoutingModule { }
