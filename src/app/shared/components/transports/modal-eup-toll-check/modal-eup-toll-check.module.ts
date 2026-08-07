import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalEupTollCheckComponent } from "./modal-eup-toll-check.component";
import { AngularDraggableModule } from "angular2-draggable";
import { NgBusyModule } from "ng-busy";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [ModalEupTollCheckComponent],
  imports: [CommonModule, ModalModule, NgBusyModule, AngularDraggableModule],
  exports: [ModalEupTollCheckComponent],
})
export class ModalEupTollCheckModule {}
