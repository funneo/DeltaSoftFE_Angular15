import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractExtensionComponent } from './contract-extension.component';

const routes: Routes = [{
  path:'',component:ContractExtensionComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractExtensionRoutingModule { }
