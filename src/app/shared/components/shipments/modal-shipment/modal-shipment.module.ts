import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalShipmentComponent } from './modal-shipment.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalContractCustomerModule } from '../../sales-marketing/modal-contract-customer/modal-contract-customer.module';
import { ModalQuotationCustomerModule } from '../../sales-marketing/modal-quotation-customer/modal-quotation-customer.module';
import { ModalAllAttachFileModule } from '../../workflows/modal-all-attach-file/modal-all-attach-file.module';
import { ModalAllDocumentsModule } from '../../systems/modal-all-documents/modal-all-documents.module';

@NgModule({
  declarations: [ModalShipmentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    Daterangepicker,
    ModalAttachfileModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalContractCustomerModule,
    ModalQuotationCustomerModule,
    ModalAllDocumentsModule
  ],
  exports:[ModalShipmentComponent]
})
export class ModalShipmentModule { }
