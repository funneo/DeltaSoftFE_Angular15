import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeeComponent } from './fee.component';

const routes: Routes = [
  { path: '', component: FeeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeRoutingModule { }
