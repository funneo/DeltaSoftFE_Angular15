import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalShippingTaskCsComponent } from './modal-shipping-task-cs.component';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalShipmentViewSearchModule } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { ModalListContSealModule } from '../../shipments/modal-list-cont-seal/modal-list-cont-seal.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ModalShippingTaskCsComponent],
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
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalShipmentViewSearchModule,
    ModalAttachfileModule,
    ModalListContSealModule
  ],exports:[ModalShippingTaskCsComponent]
})
export class ModalShippingTaskCsModule { }
