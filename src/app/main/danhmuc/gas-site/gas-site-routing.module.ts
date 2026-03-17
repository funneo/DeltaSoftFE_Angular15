import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GasSiteComponent } from './gas-site.component';

const routes: Routes = [
  { path: '', component: GasSiteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GasSiteRoutingModule { }
