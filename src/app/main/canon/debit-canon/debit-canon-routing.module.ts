import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DebitCanonComponent } from './debit-canon.component';

const routes: Routes = [
  { path: '', component: DebitCanonComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebitCanonRoutingModule { }
