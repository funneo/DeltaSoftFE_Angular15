import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionTrainingDocumentComponent } from './permission-training-document.component';

const routes: Routes = [{
  path: '',component:PermissionTrainingDocumentComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionTrainingDocumentRoutingModule { }
