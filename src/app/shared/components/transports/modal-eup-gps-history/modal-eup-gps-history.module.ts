import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalEupGpsHistoryComponent } from "./modal-eup-gps-history.component";
import { AngularDraggableModule } from "angular2-draggable";
import { NgBusyModule } from "ng-busy";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [ModalEupGpsHistoryComponent],
  imports: [CommonModule, ModalModule, NgBusyModule, AngularDraggableModule],
  exports: [ModalEupGpsHistoryComponent],
})
export class ModalEupGpsHistoryModule {}
