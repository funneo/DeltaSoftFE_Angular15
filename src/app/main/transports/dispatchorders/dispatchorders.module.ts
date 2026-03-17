import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DispatchordersRoutingModule } from './dispatchorders-routing.module';
import { PerformDispatchOrderModule } from './perform-dispatch-order/perform-dispatch-order.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DispatchordersRoutingModule,
    PerformDispatchOrderModule
  ]
})
export class DispatchordersModule { }
