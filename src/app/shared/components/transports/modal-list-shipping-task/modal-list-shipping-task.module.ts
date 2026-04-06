import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalListShippingTaskComponent } from './modal-list-shipping-task.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Daterangepicker } from 'ng2-daterangepicker';



@NgModule({
  declarations: [ModalListShippingTaskComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    Daterangepicker,
  ],exports:[ModalListShippingTaskComponent]
})
export class ModalListShippingTaskModule {}
