import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'advance', pathMatch: 'full' },
  { path: 'advance', loadChildren: () => import('./advance/advance.module').then(m => m.AdvanceModule), data: { functionCode: 'ADVANCE' }, canActivate: [AuthGuard] },
  { path: 'advance-transfer', loadChildren: () => import('./advance-transfer/advance-transfer.module').then(m => m.AdvanceTransferModule), data: { functionCode: 'F021' }, canActivate: [AuthGuard] },
  { path: 'loan', loadChildren: () => import('./personal-loan/personal-loan.module').then(m => m.PersonalLoanModule), data: { functionCode: 'LOAN' }, canActivate: [AuthGuard] },
  { path: 'repayment', loadChildren: () => import('./repayment/repayment.module').then(m => m.RepaymentModule), data: { functionCode: 'REPAYMENT' }, canActivate: [AuthGuard] },
  { path: 'payment', loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule), data: { functionCode: 'PAYMENT' }, canActivate: [AuthGuard] },
  { path: 'bets', loadChildren: () => import('./cont-bets/cont-bets.module').then(m => m.ContBetsModule), data: { functionCode: 'BETS' }, canActivate: [AuthGuard] },
  { path: 'rebets', loadChildren: () => import('./rebets/rebets.module').then(m => m.RebetsModule), data: { functionCode: 'REBETS' }, canActivate: [AuthGuard] },
  { path: 'employeelimit', loadChildren: () => import('./employee-limit/employee-limit.module').then(m => m.EmployeeLimitModule), data: { functionCode: 'EMPLOYEELIMIT' }, canActivate: [AuthGuard] },
  { path: 'payment', loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule), data: { functionCode: 'PAYMENT' }, canActivate: [AuthGuard] },
  { path: 'payment-accept', loadChildren: () => import('./payment-accept/payment-accept.module').then(m => m.PaymentAcceptModule), data: { functionCode: 'PAYMENTACCEPT' }, canActivate: [AuthGuard] },
  { path: 'payment-accept-step1', loadChildren: () => import('./payment-accept-step1/payment-accept-step1.module').then(m => m.PaymentAcceptStep1Module), data: { functionCode: 'PA1' }, canActivate: [AuthGuard] },
  { path: 'payment-debt-invoice', loadChildren: () => import('./payment-debt-invoice/payment-debt-invoice.module').then(m => m.PaymentDebtInvoiceModule), data: { functionCode: 'F001' }, canActivate: [AuthGuard] },
  { path: 'deposit', loadChildren: () => import('./deposit/deposit.module').then(m => m.DepositModule), data: { functionCode: 'DEPOSIT' }, canActivate: [AuthGuard] },
  { path: 'inventory', loadChildren: () => import('./debt-inventory/debt-inventory.module').then(m => m.DebtInventoryModule), data: { functionCode: 'INVENTORY' }, canActivate: [AuthGuard] },
  { path: 'report-payment', loadChildren: () => import('./report-payment-detail/report-payment-detail.module').then(m => m.ReportPaymentDetailModule), data: { functionCode: 'REPORTPAYMENT' }, canActivate: [AuthGuard] },
  { path: 'empoyee-debit-closing', loadChildren: () => import('./employee-debit-closing/employee-debit-closing.module').then(m => m.EmployeeDebitClosingModule), data: { functionCode: 'ADVANCE' }, canActivate: [AuthGuard] },
  { path: 'additional-invoice-information', loadChildren: () => import('./additional-invoice-information/additional-invoice-information.module').then(m => m.AdditionalInvoiceInformationModule), data: { functionCode: 'F002' }, canActivate: [AuthGuard] },
  { path: 'pending-invoice', loadChildren: () => import('./pending-invoice/pending-invoice.module').then(m => m.PendingInvoiceModule), data: { functionCode: 'F043' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvancePaymentRoutingModule { }
