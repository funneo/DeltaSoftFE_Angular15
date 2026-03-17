import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupFeeComponent } from './group-fee.component';

const routes: Routes = [
  { path: '', component: GroupFeeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupFeeRoutingModule { }
