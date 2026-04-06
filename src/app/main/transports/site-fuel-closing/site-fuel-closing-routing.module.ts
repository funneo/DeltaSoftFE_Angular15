import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SiteFuelClosingComponent } from './site-fuel-closing.component';

const routes: Routes = [{
  path: '', component: SiteFuelClosingComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiteFuelClosingRoutingModule { }
