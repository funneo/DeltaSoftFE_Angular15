import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'potential-customer', pathMatch: 'full' },
  { path: 'potential-customer', loadChildren: () => import('./potential-customer/potential-customer.module').then(m => m.PotentialCustomerModule), data: { functionCode: 'POTENTIAL-CUSTOMER' }, canActivate: [AuthGuard] },
  { path: 'contract-customer', loadChildren: () => import('./contract-customer/contract-customer.module').then(m => m.ContractCustomerModule), data: { functionCode: 'CONTRACTCUSTOMER' }, canActivate: [AuthGuard] },
  { path: 'quotation-dk04', loadChildren: () => import('./quotation-dk04/quotation-dk04.module').then(m => m.QuotationDk04Module), data: { functionCode: 'Q04' }, canActivate: [AuthGuard] },
  { path: 'quotation-customer', loadChildren: () => import('./quotation-customer/quotation-customer.module').then(m => m.QuotationCustomerModule), data: { functionCode: 'QUOTATIONCUSTOMER' }, canActivate: [AuthGuard] },
  { path: 'sales-customer', loadChildren: () => import('./sales-customer/sales-customer.module').then(m => m.SalesCustomerModule), data: { functionCode: 'SC' }, canActivate: [AuthGuard] },
  { path: 'customer-dk05', loadChildren: () => import('./customer-dk05/customer-dk05.module').then(m => m.CustomerDk05Module), data: { functionCode: 'SC05' }, canActivate: [AuthGuard] },
  { path: 'contract-extension', loadChildren: () => import('./contract-extension/contract-extension.module').then(m => m.ContractExtensionModule), data: { functionCode: 'CE' }, canActivate: [AuthGuard] },
  { path: 'sublist-sales-marketing', loadChildren: () => import('./sublist-category/sublist-category.module').then(m => m.SublistCategoryModule), data: { functionCode: 'F019' }, canActivate: [AuthGuard] },
 ];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesMarketingRoutingModule { }
