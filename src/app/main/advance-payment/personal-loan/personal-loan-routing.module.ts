import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PersonalLoanComponent } from './personal-loan.component';

const routes: Routes = [
  { path: '', component: PersonalLoanComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalLoanRoutingModule { }
