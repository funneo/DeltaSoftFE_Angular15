import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalGoLateBackEarlyComponent } from "./modal-go-late-back-early.component";
import { FormsModule } from "@angular/forms";
import { PipeSharedModule } from "@app/shared/pipes/pipe-shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { AngularDraggableModule } from "angular2-draggable";
import { NgBusyModule } from "ng-busy";
import { Daterangepicker } from "ng2-daterangepicker";
import { ModalModule } from "ngx-bootstrap/modal";
import { TabsModule } from "ngx-bootstrap/tabs";

@NgModule({
  declarations: [ModalGoLateBackEarlyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    TabsModule.forRoot(),
    NgSelectModule,
    Daterangepicker,
    PipeSharedModule,
  ],
  exports: [ModalGoLateBackEarlyComponent],
})
export class ModalGoLateBackEarlyModule {}
