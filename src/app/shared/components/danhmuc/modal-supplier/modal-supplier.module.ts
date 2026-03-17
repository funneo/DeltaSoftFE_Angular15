import { ModalSupplierVehicleModule } from './../modal-supplier-vehicle/modal-supplier-vehicle.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSupplierComponent } from './modal-supplier.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalSupplierDriverModule } from '../modal-supplier-driver/modal-supplier-driver.module';



@NgModule({
  declarations: [ModalSupplierComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    ModalSupplierDriverModule,
    ModalSupplierVehicleModule
  ],
  exports:[ModalSupplierComponent]
})
export class ModalSupplierModule { }
