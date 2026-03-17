import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContBetsComponent } from './cont-bets.component';

const routes: Routes = [
  { path: '', component: ContBetsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContBetsRoutingModule { }
