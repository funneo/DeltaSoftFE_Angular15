import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DbsShipmentsRoutingModule } from './dbs-shipments-routing.module';
import { DbsShipmentsComponent } from './dbs-shipments.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalDbsShipmentModule } from '@app/shared/components/dbs/modal-dbs-shipment/modal-dbs-shipment.module';
import { TabsModule } from 'ngx-bootstrap/tabs';


@NgModule({
  declarations: [DbsShipmentsComponent],
  imports: [
    CommonModule,
    DbsShipmentsRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    Daterangepicker,
    PipeSharedModule,
    TabsModule.forRoot(),
    NgSelectModule,
    ModalDbsShipmentModule
  ]
})
export class DbsShipmentsModule { }
