import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeDebitTransferClosingRoutingModule } from './employee-debit-transfer-closing-routing.module';
import { EmployeeDebitTransferClosingComponent } from './employee-debit-transfer-closing.component';


@NgModule({
  declarations: [EmployeeDebitTransferClosingComponent],
  imports: [
    CommonModule,
    EmployeeDebitTransferClosingRoutingModule
  ]
})
export class EmployeeDebitTransferClosingModule { }
