import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalVetcTollCheckComponent } from "./modal-vetc-toll-check.component";
import { AngularDraggableModule } from "angular2-draggable";
import { NgBusyModule } from "ng-busy";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [ModalVetcTollCheckComponent],
  imports: [CommonModule, ModalModule, NgBusyModule, AngularDraggableModule],
  exports: [ModalVetcTollCheckComponent],
})
export class ModalVetcTollCheckModule {}
