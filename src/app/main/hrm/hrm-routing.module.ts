import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'overtime', pathMatch: 'full' },
  { path: 'overtime', loadChildren: () => import('./overtime/overtime.module').then(m => m.OvertimeModule), data: { functionCode: 'OVERTIME' }, canActivate: [AuthGuard] },
  { path: 'onleave', loadChildren: () => import('./onleave/onleave.module').then(m => m.OnleaveModule), data: { functionCode: 'ONLEAVE' }, canActivate: [AuthGuard] },  
  { path: 'onleavemanagement', loadChildren: () => import('./onleave-management/onleave-management.module').then(m => m.OnleaveManagementModule), data: { functionCode: 'ONLEAVEMANAGEMENT' }, canActivate: [AuthGuard] },  
  { path: 'timekeeping', loadChildren: () => import('./time-keeping/time-keeping.module').then(m => m.TimeKeepingModule), data: { functionCode: 'TIMEKEEPING' }, canActivate: [AuthGuard] },  
  { path: 'golate', loadChildren: () => import('./go-late-back-early/go-late-back-early.module').then(m => m.GoLateBackEarlyModule), data: { functionCode: 'F022' }, canActivate: [AuthGuard] },
  { path: 'office-attendance', loadChildren: () => import('./office-attendance/office-attendance.module').then(m => m.OfficeAttendanceModule), data: { functionCode: 'F044' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrmRoutingModule { }
