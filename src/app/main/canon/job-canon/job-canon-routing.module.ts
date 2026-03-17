import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobCanonComponent } from './job-canon.component';

const routes: Routes = [
  { path: '', component: JobCanonComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobCanonRoutingModule { }
