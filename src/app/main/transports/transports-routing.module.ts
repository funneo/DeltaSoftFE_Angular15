import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dispatchorder', pathMatch: 'full' },
  { path: 'dispatchorder',loadChildren: () => import('./dispatchorders/dispatchorders.module').then(m => m.DispatchordersModule), data: { functionCode: 'DISPATCHORDER'}, canActivate: [AuthGuard] },
  { path: 'dispatch-order-fcl',loadChildren: () => import('./dispatch-order-fcl/dispatch-order-fcl.module').then(m => m.DispatchOrderFclModule), data: { functionCode: 'DISPATCHORDER'}, canActivate: [AuthGuard] },
  { path: 'quotationsubcontractors', loadChildren: () => import('./quotationsubcontractors/quotationsubcontractors.module').then(m => m.QuotationsubcontractorsModule), data: { functionCode: 'QUOTATIONSUB' }, canActivate: [AuthGuard] },
  { path: 'importgas', loadChildren: () => import('./import-gas/import-gas.module').then(m => m.ImportGasModule), data: { functionCode: 'IMPORTGAS' }, canActivate: [AuthGuard] },
  { path: 'driverfuelapproval', loadChildren: () => import('./driver-fuel-approval/driver-fuel-approval.module').then(m => m.DriverFuelApprovalModule), data: { functionCode: 'DRIVERFUELAPPROVAL' }, canActivate: [AuthGuard] },
  { path: 'commonfuelapproval', loadChildren: () => import('./common-fuel-approval/common-fuel-approval.module').then(m => m.CommonFuelApprovalModule), data: { functionCode: 'COMMONFUELAPPROVAL' }, canActivate: [AuthGuard] },
  { path: 'sitefuelclosing', loadChildren: () => import('./site-fuel-closing/site-fuel-closing.module').then(m => m.SiteFuelClosingModule), data: { functionCode: 'SITEFUELCLOSING' }, canActivate: [AuthGuard] },
  { path: 'driverfueldebitcredit', loadChildren: () => import('./driver-fuel-debit-credit/driver-fuel-debit-credit.module').then(m => m.DriverFuelDebitCreditModule), data: { functionCode: 'DRIVERFUELDEBITCREDIT' }, canActivate: [AuthGuard] },
  { path: 'driverfuellimit', loadChildren: () => import('./driver-fuel-limit/driver-fuel-limit.module').then(m => m.DriverFuelLimitModule), data: { functionCode: 'DRIVERFUELLIMIT' }, canActivate: [AuthGuard] },
  { path: 'gasmanagement', loadChildren: () => import('./gas-management/gas-management.module').then(m => m.GasManagementModule), data: { functionCode: 'GASMANAGEMENT' }, canActivate: [AuthGuard] },
  { path: 'externaloilpurchased', loadChildren: () => import('./external-oil-purchased/external-oil-purchased.module').then(m => m.ExternalOilPurchasedModule), data: { functionCode: 'EXTERNALOILPURCHASED' }, canActivate: [AuthGuard] },
  { path: 'dispatchorderreport01', loadChildren: () => import('./dispatch-order-report01/dispatch-order-report01.module').then(m => m.DispatchOrderReport01Module), data: { functionCode: 'DISPATCHORDERR01' }, canActivate: [AuthGuard] },
  { path: 'dispatchorderreport02', loadChildren: () => import('./dispatch-order-report02/dispatch-order-report02.module').then(m => m.DispatchOrderReport02Module), data: { functionCode: 'DISPATCHORDERR02' }, canActivate: [AuthGuard] },
  { path: 'dispatchorderreport03', loadChildren: () => import('./dispatch-order-report03/dispatch-order-report03.module').then(m => m.DispatchOrderReport03Module), data: { functionCode: 'DISPATCHORDERR03' }, canActivate: [AuthGuard] },
  { path: 'additionalfee', loadChildren: () => import('./dispatch-order-additional-fee/dispatch-order-additional-fee.module').then(m => m.DispatchOrderAdditionalFeeModule), data: { functionCode: 'DOAF' }, canActivate: [AuthGuard] },
  { path: 'repaymentetc', loadChildren: () => import('./repayment-etc/repayment-etc.module').then(m => m.RepaymentEtcModule), data: { functionCode: 'RPE' }, canActivate: [AuthGuard] },
  { path: 'shippingopman', loadChildren: () => import('./shipping-task-opman/shipping-task-opman.module').then(m => m.ShippingTaskOpmanModule), data: { functionCode: 'F010' }, canActivate: [AuthGuard] },
  { path: 'shippingcs', loadChildren: () => import('./shipping-task-cs/shipping-task-cs.module').then(m => m.ShippingTaskCsModule), data: { functionCode: 'WORKFLOW' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportsRoutingModule { }
