import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTransportOrderComponent } from './modal-transport-order.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';

@NgModule({
  declarations: [ModalTransportOrderComponent],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgSelectModule,
    PipeSharedModule
  ],
  exports: [ModalTransportOrderComponent]
})
export class ModalTransportOrderModule { }
