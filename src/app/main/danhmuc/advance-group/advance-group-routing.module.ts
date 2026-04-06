import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdvanceGroupComponent } from './advance-group.component';

const routes: Routes = [
  { path: '', component: AdvanceGroupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvanceGroupRoutingModule { }
