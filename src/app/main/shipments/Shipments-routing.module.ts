import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'shipment', pathMatch: 'full' },
  { path: 'shipment', loadChildren: () => import('./shipment/shipment.module').then(m => m.ShipmentModule), data: { functionCode: 'SHIPMENT' }, canActivate: [AuthGuard] },
  { path: 's1', loadChildren: () => import('./shipment-normal/shipment-normal.module').then(m => m.ShipmentNormalModule), data: { functionCode: 'SHIPMENT' }, canActivate: [AuthGuard] },
  { path: 'openshipment', loadChildren: () => import('./open-shipment/open-shipment.module').then(m => m.OpenShipmentModule), data: { functionCode: 'OPENSHIPMENT' }, canActivate: [AuthGuard] },
  { path: 'debit-notes', loadChildren: () => import('./debit-note/debit-note.module').then(m => m.DebitNoteModule), data: { functionCode: 'DEBITNOTES' }, canActivate: [AuthGuard] },
  { path: 'open-debit-note', loadChildren: () => import('./open-debit-note/open-debit-note.module').then(m => m.OpenDebitNoteModule), data: { functionCode: 'OPENDEBITNOTE' }, canActivate: [AuthGuard] },
  { path: 'report-revenue', loadChildren: () => import('./report-revenue/report-revenue.module').then(m => m.ReportRevenueModule), data: { functionCode: 'REPORTREVENUE' }, canActivate: [AuthGuard] },
  { path: 'reportrevenuefilter', loadChildren: () => import('./report-revenue-filter/report-revenue-filter.module').then(m => m.ReportRevenueFilterModule), data: { functionCode: 'REPORTREVENUE' }, canActivate: [AuthGuard] },
  { path: 'report-cp03', loadChildren: () => import('./report-cp03/report-cp03.module').then(m => m.ReportCp03Module), data: { functionCode: 'REPORTCP03' }, canActivate: [AuthGuard] },
  { path: 'report-cp03-filter', loadChildren: () => import('./report-cp03-filter/report-cp03-filter.module').then(m => m.ReportCp03FilterModule), data: { functionCode: 'REPORTCP03' }, canActivate: [AuthGuard] },
  { path: 'report-not-debit', loadChildren: () => import('./report-shipment-not-debit/report-shipment-not-debit.module').then(m => m.ReportShipmentNotDebitModule), data: { functionCode: 'NOTDEBIT' }, canActivate: [AuthGuard] },
  { path: 'statement', loadChildren: () => import('./report-statement/report-statement.module').then(m => m.ReportStatementModule), data: { functionCode: 'STATEMENT' }, canActivate: [AuthGuard] },
  { path: 'statementfilter', loadChildren: () => import('./report-statement-filter/report-statement-filter.module').then(m => m.ReportStatementFilterModule), data: { functionCode: 'STATEMENT' }, canActivate: [AuthGuard] },
  { path: 'report-debit-detail', loadChildren: () => import('./report-debitnote-detail/report-debitnote-detail.module').then(m => m.ReportDebitnoteDetailModule), data: { functionCode: 'REPORTDEBITDETAIL' }, canActivate: [AuthGuard] },
  { path: 'report-debit-detail-filter', loadChildren: () => import('./report-debitnote-detail-filter/report-debitnote-detail-filter.module').then(m => m.ReportDebitnoteDetailFilterModule), data: { functionCode: 'REPORTDEBITDETAIL' }, canActivate: [AuthGuard] },
  { path: 'report-bc01', loadChildren: () => import('./report-bc02/report-bc01.module').then(m => m.ReportBc01Module), data: { functionCode: 'REPORT01' }, canActivate: [AuthGuard] },
  { path: 'report-bc01-filter', loadChildren: () => import('./report-bc01/report-bc01-filter.module').then(m => m.ReportBc01FilterModule), data: { functionCode: 'REPORT01' }, canActivate: [AuthGuard] },
  { path: 'dbsshipment', loadChildren: () => import('./dbs-shipments/dbs-shipments.module').then(m => m.DbsShipmentsModule), data: { functionCode: 'DBS' }, canActivate: [AuthGuard] },
  { path: 'locking-debit', loadChildren: () => import('./locking-debit-note/locking-debit-note.module').then(m => m.LockingDebitNoteModule), data: { functionCode: 'DL' }, canActivate: [AuthGuard] },
  { path: 'accept-debit', loadChildren: () => import('./accept-debit-note/accept-debit-note.module').then(m => m.AcceptDebitNoteModule), data: { functionCode: 'F005' }, canActivate: [AuthGuard] },
  { path: 'bc04-dt12', loadChildren: () => import('./report-bc04-dt12/report-bc04-dt12.module').then(m => m.ReportBc04Dt12Module), data: { functionCode: 'F020' }, canActivate: [AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShipmentsRoutingModule { }
