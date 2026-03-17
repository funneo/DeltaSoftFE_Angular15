import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListTrainingDocumentsComponent } from './list-training-documents.component';

const routes: Routes = [{
  path: '',component: ListTrainingDocumentsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListTrainingDocumentsRoutingModule { }
