import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhieuChiComponent } from './phieu-chi.component';

const routes: Routes = [
  { path: '', component: PhieuChiComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhieuChiRoutingModule { }
