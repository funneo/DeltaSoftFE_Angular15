import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'systems',
        loadChildren: () =>
          import('./systems/systems.module').then((m) => m.SystemsModule),
      },
      {
        path: 'danhmuc',
        loadChildren: () =>
          import('./danhmuc/danhmuc.module').then((m) => m.DanhmucModule),
      },
      {
        path: 'shipments',
        loadChildren: () =>
          import('./shipments/shipments.module').then((m) => m.ShipmentsModule),
      },
      {
        path: 'workflows',
        loadChildren: () =>
          import('./workflows/workflows.module').then((m) => m.WorkflowsModule),
      },
      {
        path: 'advance-payment',
        loadChildren: () =>
          import('./advance-payment/advance-payment.module').then((m) => m.AdvancePaymentModule),
      },
      {
        path: 'transports',
        loadChildren: () =>
          import('./transports/transports.module').then((m) => m.TransportsModule),
      },
      {
        path: 'cbt',
        loadChildren: () =>
          import('./cbts/cbt.module').then((m) => m.CbtModule),
      },
      {
        path: 'accounting',
        loadChildren: () =>
          import('./accounting/accounting.module').then((m) => m.AccountingModule),
      },
      {
        path: 'sales-marketing',
        loadChildren: () =>
          import('./sales-marketing/sales-marketing.module').then((m) => m.SalesMarketingModule),
      },
      {
        path:'hrm',
        loadChildren:()=>
          import('./hrm/hrm-routing.module').then((m)=>m.HrmRoutingModule)
      },
      {
        path:'canon',
        loadChildren:()=>
          import('./canon/canon-routing.module').then((m)=>m.CanonRoutingModule)
      },
      {
        path:'garage',
        loadChildren:()=>
          import('./garage/garage-routing.module').then((m)=>m.GarageRoutingModule)
      },
      {
        path:'trainingmaterialsmanagement',
        loadChildren:()=>
          import('./training-materials-management/training-materials-management-routing.module').then((m)=>m.TrainingMaterialsManagementRoutingModule)
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule { }
