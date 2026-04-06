import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuotationSubCanonComponent } from './quotation-sub-canon.component';

const routes: Routes = [
  { path: '', component: QuotationSubCanonComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationSubCanonRoutingModule { }
