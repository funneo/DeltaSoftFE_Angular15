import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalClosingFclProcessComponent } from "./modal-closing-fcl-process.component";
import { FormsModule } from "@angular/forms";
import { AngularDraggableModule } from "angular2-draggable";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  declarations: [ModalClosingFclProcessComponent],
  imports: [CommonModule, ModalModule, FormsModule, AngularDraggableModule],
  exports: [ModalClosingFclProcessComponent],
})
export class ModalClosingFclProcessModule {}
