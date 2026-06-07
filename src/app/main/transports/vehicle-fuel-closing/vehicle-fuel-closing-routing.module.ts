import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VehicleFuelClosingComponent } from './vehicle-fuel-closing.component';

const routes: Routes = [{ path: '', component: VehicleFuelClosingComponent }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class VehicleFuelClosingRoutingModule {}
