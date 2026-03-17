import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransportCategoryComponent } from './transport-category.component';

const routes: Routes = [{
  path:'',component:TransportCategoryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportCategoryRoutingModule { }
