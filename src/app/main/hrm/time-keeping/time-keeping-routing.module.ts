import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeKeepingComponent } from './time-keeping.component';

const routes: Routes = [
  { path: '', component: TimeKeepingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeKeepingRoutingModule { }
