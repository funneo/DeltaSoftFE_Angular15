import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dispatch-order-cbt', pathMatch: 'full' },
  { path: 'dispatch-order-cbt',loadChildren: () => import('./dispatch-order-cbt/dispatch-order-cbt.module').then(m => m.DispatchOrderCbtModule), data: { functionCode: 'F003'}, canActivate: [AuthGuard] },
  { path: 'advance-cbt',loadChildren: () => import('./advance-cbt/advance-cbt.module').then(m => m.AdvanceCbtModule), data: { functionCode: 'F004'}, canActivate: [AuthGuard] },
  { path: 'payment-cbt',loadChildren: () => import('./payment-cbt/payment-cbt.module').then(m => m.PaymentCbtModule), data: { functionCode: 'F006'}, canActivate: [AuthGuard] },
  { path: 'cap-dau-xe-nha',loadChildren: () => import('./driver-fuel-approval-cbt/driver-fuel-approval-cbt.module').then(m => m.DriverFuelApprovalCbtModule), data: { functionCode: 'F007'}, canActivate: [AuthGuard] },
  { path: 'mua-dau-ngoai',loadChildren: () => import('./external-oil-purchased-cbt/external-oil-purchased-cbt.module').then(m => m.ExternalOilPurchasedCbtModule), data: { functionCode: 'F008'}, canActivate: [AuthGuard] },
  { path: 'report-revenue',loadChildren: () => import('./report-revenue-cbt/report-revenue-cbt.module').then(m => m.ReportRevenueCbtModule), data: { functionCode: 'F014'}, canActivate: [AuthGuard] },
  { path: 'report-costs',loadChildren: () => import('./report-costs/report-costs.module').then(m => m.ReportCostsModule), data: { functionCode: 'F015'}, canActivate: [AuthGuard] },
  { path: 'report-profit',loadChildren: () => import('./report-cbt-bc01/report-cbt-bc01.module').then(m => m.ReportCbtBc01Module), data: { functionCode: 'F016'}, canActivate: [AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CbtRoutingModule { }
 