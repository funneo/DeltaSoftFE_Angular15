import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TolllocationsComponent } from './tolllocations.component';

const routes: Routes = [{
  path:'',component:TolllocationsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TolllocationsRoutingModule { }
