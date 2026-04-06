import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransitPortsComponent } from './transit-ports.component';

const routes: Routes = [{
  path: '',component: TransitPortsComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransitPortsRoutingModule { }
