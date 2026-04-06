import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'phieuthu', pathMatch: 'full' },
  { path: 'phieu-chi', loadChildren: () => import('./phieu-chi/phieu-chi.module').then(m => m.PhieuChiModule), data: { functionCode: 'CHI' }, canActivate: [AuthGuard] },
  { path: 'phieu-thu', loadChildren: () => import('./phieu-thu/phieu-thu.module').then(m => m.PhieuThuModule), data: { functionCode: 'THU' }, canActivate: [AuthGuard] },
  { path: 'funds', loadChildren: () => import('./fund/fund.module').then(m => m.FundModule), data: { functionCode: 'FUNDS' }, canActivate: [AuthGuard] },
  { path: 'fund-reserve', loadChildren: () => import('./fund-reserve/fund-reserve.module').then(m => m.FundReserveModule), data: { functionCode: 'FUNDRESERVE' }, canActivate: [AuthGuard] },
  { path: 'accounting-debit-credit', loadChildren: () => import('./accounting-debit-credit/accounting-debit-credit.module').then(m => m.AccountingDebitCreditModule), data: { functionCode: 'TKNOCO' }, canActivate: [AuthGuard] },
  { path: 'employee-debit-credit', loadChildren: () => import('./employee-debit-credit/employee-debit-credit.module').then(m => m.EmployeeDebitCreditModule), data: { functionCode: 'EMPLOYEEDEBIT' }, canActivate: [AuthGuard] },
  { path: 'export-invoice', loadChildren: () => import('./export-invoice/export-invoice.module').then(m => m.ExportInvoiceModule), data: { functionCode: 'INVOICE' }, canActivate: [AuthGuard] },
  { path: 'debt-customer', loadChildren: () => import('./debt/debt.module').then(m => m.DebtModule), data: { functionCode: 'DEBT1' }, canActivate: [AuthGuard] },
  { path: 'debt-supplier', loadChildren: () => import('./debt-supplier/debt-supplier.module').then(m => m.DebtSupplierModule), data: { functionCode: 'DEBT2' }, canActivate: [AuthGuard] },
  { path: 'debt-report', loadChildren: () => import('./debt-report/debt-report.module').then(m => m.DebtReportModule), data: { functionCode: 'DEBTREPORT' }, canActivate: [AuthGuard] },
  { path: 'dunonhanvien', loadChildren: () => import('./list-employee-debit-credit/list-employee-debit-credit.module').then(m => m.ListEmployeeDebitCreditModule), data: { functionCode: 'EMPLOYEEDEBIT' }, canActivate: [AuthGuard] },
  { path: 'summary-supplier-cost', loadChildren: () => import('./summary-supplier-cost/summary-supplier-cost.module').then(m => m.SummarySupplierCostModule), data: { functionCode: 'F018' }, canActivate: [AuthGuard] },
  { path: 'on-behalf-payment', loadChildren: () => import('./on-behalf-payment/on-behalf-payment.module').then(m => m.OnBehalfPaymentModule), data: { functionCode: 'F042' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
