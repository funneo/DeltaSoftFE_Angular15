import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingCanonRoutingModule } from './shipping-canon-routing.module';
import { ShippingCanonComponent } from './shipping-canon.component';


@NgModule({
  declarations: [ShippingCanonComponent],
  imports: [
    CommonModule,
    ShippingCanonRoutingModule
  ]
})
export class ShippingCanonModule { }
