import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'workflow', pathMatch: 'full' },
  { path: 'workflow', loadChildren: () => import('./workflow/workflow.module').then(m => m.WorkflowModule), data: { functionCode: 'WORKFLOW' }, canActivate: [AuthGuard] },
  { path: 'assigningjob', loadChildren: () => import('./assigningjob/assigningjob.module').then(m => m.AssigningjobModule), data: { functionCode: 'ASSIGNINGJOB' }, canActivate: [AuthGuard] },
  { path: 'assignedjob', loadChildren: () => import('./assignedjob/assignedjob.module').then(m => m.AssignedjobModule), data: { functionCode: 'ASSIGNEDJOB' }, canActivate: [AuthGuard] },
  { path: 'reportbc01', loadChildren: () => import('./workflow-report-bc01/workflow-report-bc01.module').then(m => m.WorkflowReportBc01Module), data: { functionCode: 'WRPT01' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule { }
