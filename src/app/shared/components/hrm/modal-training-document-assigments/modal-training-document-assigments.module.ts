import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ModalTrainingDocumentAssigmentsComponent } from "./modal-training-document-assigments.component";
import { FormsModule } from "@angular/forms";
import { PipeSharedModule } from "@app/shared/pipes/pipe-shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { AngularDraggableModule } from "angular2-draggable";
import { ModalModule } from "ngx-bootstrap/modal";
import { TabsModule } from "ngx-bootstrap/tabs";

@NgModule({
  declarations: [ModalTrainingDocumentAssigmentsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
  ],exports: [ModalTrainingDocumentAssigmentsComponent],
})
export class ModalTrainingDocumentAssigmentsModule {}
