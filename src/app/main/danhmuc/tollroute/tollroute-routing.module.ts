import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TollrouteComponent } from './tollroute.component';

const routes: Routes = [{
   path:'',component:TollrouteComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TollrouteRoutingModule { }
