import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalSummarySupplierCostComponent } from "./modal-summary-supplier-cost.component";
import { FormsModule } from "@angular/forms";
import { PipeSharedModule } from "@app/shared/pipes/pipe-shared.module";
import { UtilityService } from "@app/shared/services";
import { NgSelectModule } from "@ng-select/ng-select";
import { AngularDraggableModule } from "angular2-draggable";
import { Daterangepicker } from "ng2-daterangepicker";
import { ModalModule } from "ngx-bootstrap/modal";
import { NgxMaskModule } from "ngx-mask";
import { ModalAttachfileModule } from "../../systems/modal-attachfile/modal-attachfile.module";
import { ModalPhieuChiModule } from "../modal-phieu-chi/modal-phieu-chi.module";

@NgModule({
  declarations: [ModalSummarySupplierCostComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    AngularDraggableModule,
    NgSelectModule,
    Daterangepicker,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    PipeSharedModule,
    ModalAttachfileModule,
    ModalPhieuChiModule
  ],
  exports: [ModalSummarySupplierCostComponent],
})
export class ModalSummarySupplierCostModule {}
