import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dispatchorder', pathMatch: 'full' },
  { path: 'dispatchorder', loadChildren: () => import('./dispatchorder/dispatchorder.module').then(m => m.DispatchorderModule), data: { functionCode: 'DISPATCHORDER' }, canActivate: [AuthGuard] }, 
  { path: 'performdispatchorder', loadChildren: () => import('./perform-dispatch-order/perform-dispatch-order.module').then(m => m.PerformDispatchOrderModule), data: { functionCode: 'PERFORMDISPATCHORDER' }, canActivate: [AuthGuard] }, 
  { path: 'canceldispatchorder', loadChildren: () => import('./canceldispatchorder/cancel-dispatchorder.module').then(m => m.CancelDispatchorderModule), data: { functionCode: 'CANCELDISPATCHORDER' }, canActivate: [AuthGuard] }, 
  { path: 'subcontractordispatchorder', loadChildren: () => import('./subcontractors-dispatch-order/subcontractors-dispatch-order.module').then(m => m.SubcontractorsDispatchOrderModule), data: { functionCode: 'SUBCONTRACTORDISPATCHORDER' }, canActivate: [AuthGuard] }, 
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispatchordersRoutingModule { }
