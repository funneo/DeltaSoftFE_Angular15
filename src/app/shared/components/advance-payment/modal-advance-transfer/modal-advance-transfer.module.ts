import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalAdvanceTransferComponent } from "./modal-advance-transfer.component";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { PipeSharedModule } from "@app/shared/pipes/pipe-shared.module";
import { UtilityService } from "@app/shared/services";
import { NgSelectModule } from "@ng-select/ng-select";
import { AngularDraggableModule } from "angular2-draggable";
import { NgBusyModule } from "ng-busy";
import { Daterangepicker } from "ng2-daterangepicker";
import { ModalModule } from "ngx-bootstrap/modal";
import { TabsModule } from "ngx-bootstrap/tabs";
import { NgxMaskModule } from "ngx-mask";
import { ModalShipmentViewSearchModule } from "../../shipments/modal-shipment-view-search/modal-shipment-view-search.module";
import { ModalAttachfileModule } from "../../systems/modal-attachfile/modal-attachfile.module";

@NgModule({
  declarations: [ModalAdvanceTransferComponent],
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
    RouterModule,
    ModalAttachfileModule,
    ModalShipmentViewSearchModule,
  ],exports: [ModalAdvanceTransferComponent]
})
export class ModalAdvanceTransferModule {}
