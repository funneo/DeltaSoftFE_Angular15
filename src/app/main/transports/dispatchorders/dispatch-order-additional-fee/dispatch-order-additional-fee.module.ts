import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DispatchOrderAdditionalFeeRoutingModule } from './dispatch-order-additional-fee-routing.module';
import { DispatchOrderAdditionalFeeComponent } from './dispatch-order-additional-fee.component';


@NgModule({
  declarations: [DispatchOrderAdditionalFeeComponent],
  imports: [
    CommonModule,
    DispatchOrderAdditionalFeeRoutingModule
  ]
})
export class DispatchOrderAdditionalFeeModule { }
