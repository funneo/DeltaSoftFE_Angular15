import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalConfirmDenyClosingFclComponent } from "./modal-confirm-deny-closing-fcl.component";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { AngularDraggableModule } from "angular2-draggable";
import { NgBusyModule } from "ng-busy";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [ModalConfirmDenyClosingFclComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
  ],
  exports: [ModalConfirmDenyClosingFclComponent],
})
export class ModalConfirmDenyClosingFclModule {}
