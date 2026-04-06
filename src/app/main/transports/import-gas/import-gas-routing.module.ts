import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImportGasComponent } from './import-gas.component';

const routes: Routes = [{
  path: '', component: ImportGasComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportGasRoutingModule { }
