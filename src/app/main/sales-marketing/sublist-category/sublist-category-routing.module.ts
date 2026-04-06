import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SublistCategoryComponent } from './sublist-category.component';

const routes: Routes = [{
  path:'',component:SublistCategoryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SublistCategoryRoutingModule { }
