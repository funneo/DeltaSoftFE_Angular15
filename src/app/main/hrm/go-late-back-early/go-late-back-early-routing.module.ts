import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GoLateBackEarlyComponent } from './go-late-back-early.component';

const routes: Routes = [{
  path: '',component: GoLateBackEarlyComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoLateBackEarlyRoutingModule { }
