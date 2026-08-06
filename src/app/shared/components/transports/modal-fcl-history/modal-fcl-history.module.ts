import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalFclHistoryComponent } from "./modal-fcl-history.component";
import { AngularDraggableModule } from "angular2-draggable";
import { NgBusyModule } from "ng-busy";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [ModalFclHistoryComponent],
  imports: [CommonModule, ModalModule, NgBusyModule, AngularDraggableModule],
  exports: [ModalFclHistoryComponent],
})
export class ModalFclHistoryModule {}
