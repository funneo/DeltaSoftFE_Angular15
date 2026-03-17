import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OptionprocedureComponent } from './optionprocedure.component';

const routes: Routes = [
  { path: '', component: OptionprocedureComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OptionprocedureRoutingModule { }
