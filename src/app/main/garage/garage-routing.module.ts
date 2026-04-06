import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'vehicleinspection', pathMatch: 'full' },
  { path: 'vehicleinspection', loadChildren: () => import('./vehicle-inspection/vehicle-inspection.module').then(m => m.VehicleInspectionModule), data: { functionCode: 'VI' }, canActivate: [AuthGuard] },
  { path: 'v_i_permission', loadChildren: () => import('./vehicle-inspection-permission/vehicle-inspection-permission.module').then(m => m.VehicleInspectionPermissionModule), data: { functionCode: 'VIPER' }, canActivate: [AuthGuard] },
  { path: 'v_i_checking', loadChildren: () => import('./vehicle-inspection-checking/vehicle-inspection-checking.module').then(m => m.VehicleInspectionCheckingModule), data: { functionCode: 'VICHK' }, canActivate: [AuthGuard] },
  { path: 'garage01', loadChildren: () => import('./request-new-employee/request-new-employee.module').then(m => m.RequestNewEmployeeModule), data: { functionCode: 'F033' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GarageRoutingModule { }
