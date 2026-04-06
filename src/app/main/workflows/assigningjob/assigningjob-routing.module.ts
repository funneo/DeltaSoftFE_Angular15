import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssigningjobComponent } from './assigningjob.component';

const routes: Routes = [
  { path: '', component: AssigningjobComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssigningjobRoutingModule { }
