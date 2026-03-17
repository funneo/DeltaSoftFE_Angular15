import { ModalPaymentCbtModule } from '@app/shared/components/cbt/modal-payment-cbt/modal-payment-cbt.module';
import { ModalAdvanceCbtModule } from './../modal-advance-cbt/modal-advance-cbt.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDispatchOrderCbtComponent } from './modal-dispatch-order-cbt.component';
import { ModalShipmentModule } from '../../shipments/modal-shipment/modal-shipment.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalDispatchorderRouteModule } from '../../transports/modal-dispatchorder-route/modal-dispatchorder-route.module';
import { NgxMaskModule } from 'ngx-mask';
import { Daterangepicker } from 'ng2-daterangepicker';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { ModalShipmentViewSearchModule } from '../../shipments/modal-shipment-view-search/modal-shipment-view-search.module';
import { ModalDriverFuelApprovalModule } from '../../transports/modal-driver-fuel-approval/modal-driver-fuel-approval.module';
import { ModalExternalOilPurchasedModule } from '../../transports/modal-external-oil-purchased/modal-external-oil-purchased.module';



@NgModule({
  declarations: [ModalDispatchOrderCbtComponent],
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
    ModalDispatchorderRouteModule,
    ModalAttachfileModule,
    ModalShipmentModule,
    ModalShipmentViewSearchModule,
    ModalAdvanceCbtModule,
    ModalPaymentCbtModule,
    ModalDriverFuelApprovalModule,
    ModalExternalOilPurchasedModule
  ],exports:[ModalDispatchOrderCbtComponent]
})
export class ModalDispatchOrderCbtModule { }
