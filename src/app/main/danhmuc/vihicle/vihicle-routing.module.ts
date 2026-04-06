import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VihicleComponent } from './vihicle.component';

const routes: Routes = [
  {path:'',component:VihicleComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VihicleRoutingModule { }
