import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverFuelDebitCreditDetailedComponent } from './driver-fuel-debit-credit-detailed/driver-fuel-debit-credit-detailed.component';
import { DriverFuelDebitCreditComponent } from './driver-fuel-debit-credit.component';

const routes: Routes = [
  {path: '', component: DriverFuelDebitCreditComponent},
  {path: 'detailed/:id', component: DriverFuelDebitCreditDetailedComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverFuelDebitCreditRoutingModule { }
