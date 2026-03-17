import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PortsComponent } from './ports.component';

const routes: Routes = [
  {
    path: '',
    component: PortsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortsRoutingModule { }
