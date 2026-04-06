import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobgroupComponent } from './jobgroup.component';

const routes: Routes = [
  { path: '', component: JobgroupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobgroupRoutingModule { }
