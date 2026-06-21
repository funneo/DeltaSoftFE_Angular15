import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDocHoaDonComponent } from './modal-doc-hoa-don.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalPickJobModule } from '../modal-pick-job/modal-pick-job.module';

@NgModule({
  declarations: [ModalDocHoaDonComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    NgSelectModule,
    AngularDraggableModule,
    ModalPickJobModule,
  ],
  exports: [ModalDocHoaDonComponent]
})
export class ModalDocHoaDonModule { }
