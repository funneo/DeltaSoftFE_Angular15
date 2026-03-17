import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TollstationComponent } from './tollstation.component';

const routes: Routes =[{
  path:'',component:TollstationComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TollstationRoutingModule { }
