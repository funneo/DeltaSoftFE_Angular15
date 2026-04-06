import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OtherCategoriesComponent } from './other-categories.component';

const routes: Routes = [
  { path: '', component: OtherCategoriesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtherCategoriesRoutingModule { }
