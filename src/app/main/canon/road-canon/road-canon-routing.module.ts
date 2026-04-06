import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoadCanonComponent } from './road-canon.component';

const routes: Routes = [
  { path: '', component: RoadCanonComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoadCanonRoutingModule { }
