import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalUpdateAccountingDateComponent } from "./modal-update-accounting-date.component";
import { FormsModule } from "@angular/forms";
import { AngularDraggableModule } from "angular2-draggable";
import { ModalModule } from "ngx-bootstrap/modal";
import { Daterangepicker } from "ng2-daterangepicker";

@NgModule({
  declarations: [ModalUpdateAccountingDateComponent],
  imports: [CommonModule, ModalModule, FormsModule, AngularDraggableModule,Daterangepicker,],
  exports: [ModalUpdateAccountingDateComponent]
})
export class ModalUpdateAccountingDateModule {}
