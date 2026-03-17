import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkflowCanonComponent } from './workflow-canon.component';

const routes: Routes = [{
  path: '',
  component:WorkflowCanonComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowCanonRoutingModule { }
