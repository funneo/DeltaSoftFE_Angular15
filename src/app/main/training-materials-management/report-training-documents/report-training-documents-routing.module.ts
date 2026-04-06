import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportTrainingDocumentsComponent } from './report-training-documents.component';

const routes: Routes = [{
  path: '',component:ReportTrainingDocumentsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportTrainingDocumentsRoutingModule { }
