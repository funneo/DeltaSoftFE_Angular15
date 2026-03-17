import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RevenueFeeComponent } from './revenue-fee.component';

const routes: Routes = [
  { path: '', component: RevenueFeeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RevenueFeeRoutingModule { }
