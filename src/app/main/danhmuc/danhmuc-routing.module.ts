import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'branch', pathMatch: 'full' },
  { path: 'branch', loadChildren: () => import('./branch/branch.module').then(m => m.BranchModule), data: { functionCode: 'BRANCH' }, canActivate: [AuthGuard] },
  { path: 'employee', loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule), data: { functionCode: 'EMPLOYEE' }, canActivate: [AuthGuard] },
  { path: 'customer', loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule), data: { functionCode: 'CUSTOMER' }, canActivate: [AuthGuard] },
  { path: 'fee', loadChildren: () => import('./fee/fee.module').then(m => m.FeeModule), data: { functionCode: 'FEE' }, canActivate: [AuthGuard] },
  { path: 'groupfee', loadChildren: () => import('./group-fee/group-fee.module').then(m => m.GroupFeeModule), data: { functionCode: 'GROUPFEE' }, canActivate: [AuthGuard] },
  { path: 'paymentfee', loadChildren: () => import('./payment-fee/payment-fee.module').then(m => m.PaymentFeeModule), data: { functionCode: 'PAYMENTFEE' }, canActivate: [AuthGuard] },
  { path: 'revenuefee', loadChildren: () => import('./revenue-fee/revenue-fee.module').then(m => m.RevenueFeeModule), data: { functionCode: 'REVENUEFEE' }, canActivate: [AuthGuard] },
  { path: 'accountlist', loadChildren: () => import('./account-list/account-list.module').then(m => m.AccountListModule), data: { functionCode: 'ACCOUNTLIST' }, canActivate: [AuthGuard] },
  { path: 'advancegroup', loadChildren: () => import('./advance-group/advance-group.module').then(m => m.AdvanceGroupModule), data: { functionCode: 'ADVANCEGROUP' }, canActivate: [AuthGuard] },
  { path: 'othercategories', loadChildren: () => import('./other-categories/other-categories.module').then(m => m.OtherCategoriesModule), data: { functionCode: 'OTHERCATEGORIES' }, canActivate: [AuthGuard] },
  { path: 'handlinggroup', loadChildren: () => import('./handlinggroups/handlinggroups.module').then(m => m.HandlinggroupsModule), data: { functionCode: 'HANDLINGGROUP' }, canActivate: [AuthGuard] },
  { path: 'jobgroup', loadChildren: () => import('./jobgroup/jobgroup.module').then(m => m.JobgroupModule), data: { functionCode: 'JOBGROUP' }, canActivate: [AuthGuard] },
  { path: 'jobgroupoption', loadChildren: () => import('./jobgroupoption/jobgroupoption.module').then(m => m.JobgroupoptionModule), data: { functionCode: 'JOBGROUPOPTION' }, canActivate: [AuthGuard] },
  { path: 'optionprocedure', loadChildren: () => import('./optionprocedure/optionprocedure.module').then(m => m.OptionprocedureModule), data: { functionCode: 'OPTIONPROCEDURE' }, canActivate: [AuthGuard] },
  { path: 'province', loadChildren: () => import('./province/province.module').then(m => m.ProvinceModule), data: { functionCode: 'PROVINCE' }, canActivate: [AuthGuard] },
  { path: 'district', loadChildren: () => import('./district/district.module').then(m => m.DistrictModule), data: { functionCode: 'DISTRICT' }, canActivate: [AuthGuard] },
  { path: 'locations', loadChildren: () => import('./location/location.module').then(m => m.LocationModule), data: { functionCode: 'LOCATIONS' }, canActivate: [AuthGuard] },
  { path: 'route', loadChildren: () => import('./route/route.module').then(m => m.RouteModule), data: { functionCode: 'ROUTES' }, canActivate: [AuthGuard] },
  { path: 'supplier', loadChildren: () => import('./supplier/supplier.module').then(m => m.SupplierModule), data: { functionCode: 'SUPPLIERS' }, canActivate: [AuthGuard] },
  { path: 'vihicle', loadChildren: () => import('./vihicle/vihicle.module').then(m => m.VihicleModule), data: { functionCode: 'VIHICLES' }, canActivate: [AuthGuard] },
  { path: 'tollroute', loadChildren: () => import('./tollroute/tollroute.module').then(m => m.TollrouteModule), data: { functionCode: 'TOLLROUTE' }, canActivate: [AuthGuard] },
  { path: 'tollstation', loadChildren: () => import('./tollstation/tollstation.module').then(m => m.TollstationModule), data: { functionCode: 'TOLLSTATIONS' }, canActivate: [AuthGuard] },
  { path: 'tolllocations', loadChildren: () => import('./tolllocations/tolllocations.module').then(m => m.TolllocationsModule), data: { functionCode: 'TOLLLOCATIONS' }, canActivate: [AuthGuard] },
  { path: 'gassite', loadChildren: () => import('./gas-site/gas-site.module').then(m => m.GasSiteModule), data: { functionCode: 'GASSITES' }, canActivate: [AuthGuard] },
  { path: 'vehicleinspectionjob', loadChildren: () => import('./vehicle-inspection-job/vehicle-inspection-job.module').then(m => m.VehicleInspectionJobModule), data: { functionCode: 'VEHICLEINSPECTIONJOB' }, canActivate: [AuthGuard] },
  { path: 'rateexchange', loadChildren: () => import('./rate-exchange/rate-exchange.module').then(m => m.RateExchangeModule), data: { functionCode: 'RE' }, canActivate: [AuthGuard] },
  { path: 'transportcategory', loadChildren: () => import('./transport-category/transport-category.module').then(m => m.TransportCategoryModule), data: { functionCode: 'F012' }, canActivate: [AuthGuard] },
  { path: 'customer-team-permission', loadChildren: () => import('./customer-team-permission/customer-team-permission.module').then(m => m.CustomerTeamPermissionModule), data: { functionCode: 'F017' }, canActivate: [AuthGuard] },
  { path: 'ports', loadChildren: () => import('./ports/ports.module').then(m => m.PortsModule), data: { functionCode: 'PORTS' }, canActivate: [AuthGuard] },
  { path: 'transitports', loadChildren: () => import('./transit-ports/transit-ports.module').then(m => m.TransitPortsModule), data: { functionCode: 'F026' }, canActivate: [AuthGuard] },
  { path: 'banks', loadChildren: () => import('./banks/banks.module').then(m => m.BanksModule), data: { functionCode: 'F040' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DanhmucRoutingModule { }
