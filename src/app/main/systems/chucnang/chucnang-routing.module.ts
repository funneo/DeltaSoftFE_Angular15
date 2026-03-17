import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChucnangComponent } from './chucnang.component';

const routes: Routes = [
  { path: '', component: ChucnangComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChucNangRoutingModule { }
