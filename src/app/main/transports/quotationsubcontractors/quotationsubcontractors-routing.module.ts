import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuotationsubcontractorsComponent } from './quotationsubcontractors.component';

const routes: Routes = [{
  path: '', component: QuotationsubcontractorsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationsubcontractorsRoutingModule { }
