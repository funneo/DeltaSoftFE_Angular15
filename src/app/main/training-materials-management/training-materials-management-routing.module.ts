import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: 'trainingdocuments', pathMatch: 'full' },
    { path: 'archive01', loadChildren: () => import('./archive01/archive01.module').then(m => m.Archive01Module), data: { functionCode: 'F031' }, canActivate: [AuthGuard] },  
    { path: 'archive02', loadChildren: () => import('./archive02/archive02.module').then(m => m.Archive02Module), data: { functionCode: 'F032' }, canActivate: [AuthGuard] },  
    { path: 'trainingdocuments', loadChildren: () => import('./list-training-documents/list-training-documents.module').then(m => m.ListTrainingDocumentsModule), data: { functionCode: 'F024' }, canActivate: [AuthGuard] },  
    { path: 'reporttrainingdocuments', loadChildren: () => import('./report-training-documents/report-training-documents.module').then(m => m.ReportTrainingDocumentsModule), data: { functionCode: 'F027' }, canActivate: [AuthGuard] },  
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainingMaterialsManagementRoutingModule { }
