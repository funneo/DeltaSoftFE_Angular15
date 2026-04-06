import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RebetsComponent } from './rebets.component';

const routes: Routes = [
  { path: '', component: RebetsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RebetsRoutingModule { }
