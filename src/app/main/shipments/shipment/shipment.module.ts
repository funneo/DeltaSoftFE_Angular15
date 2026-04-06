import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ShipmentComponent } from './shipment.component';
import { ShipmentRoutingModule } from './shipment-routing.module';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalOpenShipmentModule } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.module';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [ShipmentComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ShipmentRoutingModule,
    ModalShipmentModule,
    Daterangepicker,
    ModalOpenShipmentModule,
    ModalAttachfileModule,
    NgxSpinnerModule
  ]
})
export class ShipmentModule { }
