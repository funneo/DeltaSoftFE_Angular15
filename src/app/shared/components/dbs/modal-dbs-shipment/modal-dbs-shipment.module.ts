import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDbsShipmentComponent } from './modal-dbs-shipment.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';



@NgModule({
  declarations: [ModalDbsShipmentComponent],
  imports: [
    CommonModule,
    NgBusyModule,
    ModalModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    AngularDraggableModule,
    TabsModule.forRoot(),
  ],exports:[ModalDbsShipmentComponent]
})
export class ModalDbsShipmentModule { }
