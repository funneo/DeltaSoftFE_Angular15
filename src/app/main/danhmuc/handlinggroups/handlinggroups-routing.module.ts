import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HandlinggroupsComponent } from './handlinggroups.component';


const routes: Routes = [
  { path: '', component: HandlinggroupsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HandlinggroupsRoutingModule { }
