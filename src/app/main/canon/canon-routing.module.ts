import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'shipment', pathMatch: 'full' },
  { path: 'wfcanon', loadChildren: () => import('./workflow-canon/workflow-canon.module').then(m => m.WorkflowCanonModule), data: { functionCode: 'F035' }, canActivate: [AuthGuard] },
  { path: 'shipment', loadChildren: () => import('./job-canon/job-canon.module').then(m => m.JobCanonModule), data: { functionCode: 'JOBCANON' }, canActivate: [AuthGuard] },
  { path: 'debit', loadChildren: () => import('./debit-canon/debit-canon.module').then(m => m.DebitCanonModule), data: { functionCode: 'DEBITCANON' }, canActivate: [AuthGuard] },
  { path: 'road', loadChildren: () => import('./road-canon/road-canon.module').then(m => m.RoadCanonModule), data: { functionCode: 'ROADCANON' }, canActivate: [AuthGuard] },
  { path: 'price', loadChildren: () => import('./price-canon/price-canon.module').then(m => m.PriceCanonModule), data: { functionCode: 'PRICECANON' }, canActivate: [AuthGuard] },
  { path: 'dbcanon', loadChildren: () => import('./list-debit-note/list-debit-note.module').then(m => m.ListDebitNoteModule), data: { functionCode: 'F036' }, canActivate: [AuthGuard] },
  { path: 'dbchitiet', loadChildren: () => import('./db-chitiet-canon/db-chitiet-canon.module').then(m => m.DbChitietCanonModule), data: { functionCode: 'F036' }, canActivate: [AuthGuard] },
  { path: 'quotationsubcanon', loadChildren: () => import('./quotation-sub-canon/quotation-sub-canon.module').then(m => m.QuotationSubCanonModule), data: { functionCode: 'F038' }, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CanonRoutingModule { }
