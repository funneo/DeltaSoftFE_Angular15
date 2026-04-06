import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DbChitietCanonComponent } from './db-chitiet-canon.component';

const routes: Routes = [{
  path: '',component:DbChitietCanonComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DbChitietCanonRoutingModule { }
