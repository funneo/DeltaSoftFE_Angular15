import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalOpenShipmentModule } from '@app/shared/components/shipments/modal-open-shipment/modal-open-shipment.module';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { JobCanonRoutingModule } from './job-canon-routing.module';
import { JobCanonComponent } from './job-canon.component';
import { ModalJobCanonModule } from '@app/shared/components/canon/modal-job-canon/modal-job-canon.module';

@NgModule({
  declarations: [JobCanonComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    JobCanonRoutingModule,
    ModalJobCanonModule,
    Daterangepicker,
    ModalOpenShipmentModule,
    ModalAttachfileModule
  ]
})
export class JobCanonModule { }
