import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OnleaveComponent } from './onleave.component';

const routes: Routes = [
  { path: '', component: OnleaveComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnleaveRoutingModule { }
