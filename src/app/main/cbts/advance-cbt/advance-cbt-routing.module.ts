import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdvanceCbtComponent } from './advance-cbt.component';

const routes: Routes = [{
  path:'',component:AdvanceCbtComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvanceCbtRoutingModule { }
