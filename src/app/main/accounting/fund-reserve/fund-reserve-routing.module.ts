import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundDetailComponent } from './fund-detail/fund-detail.component';
import { FundReserveComponent } from './fund-reserve.component';

const routes: Routes = [
  { path: '', component: FundReserveComponent },
  { path: 'detail/:id', component: FundDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FundReserveRoutingModule { }
