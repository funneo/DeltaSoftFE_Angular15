import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverFuelDebitCreditRoutingModule } from './driver-fuel-debit-credit-routing.module';
import { DriverFuelDebitCreditComponent } from './driver-fuel-debit-credit.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DriverFuelDebitCreditDetailedComponent } from './driver-fuel-debit-credit-detailed/driver-fuel-debit-credit-detailed.component';



@NgModule({
  declarations: [DriverFuelDebitCreditComponent,DriverFuelDebitCreditDetailedComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    DriverFuelDebitCreditRoutingModule
  ]
})
export class DriverFuelDebitCreditModule { }
