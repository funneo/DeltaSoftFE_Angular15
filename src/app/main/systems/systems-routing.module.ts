import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule), data: { functionCode: 'USER' }, canActivate: [AuthGuard] },
  { path: 'role', loadChildren: () => import('./role/role.module').then(m => m.RoleModule), data: { functionCode: 'ROLE' }, canActivate: [AuthGuard] },
  { path: 'permission', loadChildren: () => import('./permission/permission.module').then(m => m.PermissionModule), data: { functionCode: 'PHANQUYEN' }, canActivate: [AuthGuard] },
  { path: 'function', loadChildren: () => import('./chucnang/chucnang.module').then(m => m.ChucnangModule), data: { functionCode: 'FUNCTION' }, canActivate: [AuthGuard] },
  { path: 'permissionadvance', loadChildren: () => import('./permission-advance/permission-advance.module').then(m => m.PermissionAdvanceModule), data: { functionCode: 'PERMISSIONADVANCE' }, canActivate: [AuthGuard] },
  { path: 'permissionpayment', loadChildren: () => import('./permission-payment/permission-payment.module').then(m => m.PermissionPaymentModule), data: { functionCode: 'PERMISSIONPAYMENT' }, canActivate: [AuthGuard] },
  { path: 'permissioncs', loadChildren: () => import('./permission-cs/permission-cs.module').then(m => m.PermissionCsModule), data: { functionCode: 'PERMISSIONCS' }, canActivate: [AuthGuard] },
  { path: 'permissionovertime', loadChildren: () => import('./permission-overtime/permission-overtime.module').then(m => m.PermissionOvertimeModule), data: { functionCode: 'PERMISSIONOVERTIME' }, canActivate: [AuthGuard] },
  { path: 'trainingdocumentpermission', loadChildren: () => import('./permission-training-document/permission-training-document.module').then(m => m.PermissionTrainingDocumentModule), data: { functionCode: 'F025' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemsRoutingModule { }
