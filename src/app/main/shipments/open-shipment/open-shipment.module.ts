import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalOpenShipmentModule } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.module';
import { OpenShipmentRoutingModule } from './open-shipment-routing.module';
import { OpenShipmentComponent } from './open-shipment.component';

@NgModule({
  declarations: [OpenShipmentComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    OpenShipmentRoutingModule,
    Daterangepicker,
    ModalOpenShipmentModule
  ],
  providers:[
    DatePipe,
  ]
})
export class OpenShipmentModule { }
