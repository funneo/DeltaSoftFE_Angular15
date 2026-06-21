import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalAddExtraSegmentComponent } from './modal-add-extra-segment.component';
import { ModalMapRoutesModule } from '../../danhmuc/modal-map-routes/modal-map-routes.module';

@NgModule({
  declarations: [ModalAddExtraSegmentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgSelectModule,
    ModalMapRoutesModule
  ],
  exports: [ModalAddExtraSegmentComponent]
})
export class ModalAddExtraSegmentModule { }
