import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSalesCustomerComponent } from './modal-sales-customer.component';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [ModalSalesCustomerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule
  ],
  exports:[ModalSalesCustomerComponent]
})
export class ModalSalesCustomerModule { }
