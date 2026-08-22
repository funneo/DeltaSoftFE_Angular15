import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalDocContainerComponent } from './modal-doc-container.component';

@NgModule({
  declarations: [ModalDocContainerComponent],
  imports: [CommonModule, FormsModule, ModalModule, AngularDraggableModule],
  exports: [ModalDocContainerComponent],
})
export class ModalDocContainerModule {}
