import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhieuThuComponent } from './phieu-thu.component';

const routes: Routes = [
  { path: '', component: PhieuThuComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhieuThuRoutingModule { }
