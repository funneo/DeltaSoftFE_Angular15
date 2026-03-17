import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSupplierDriverComponent } from './modal-supplier-driver.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [ModalSupplierDriverComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    Daterangepicker,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
  ],exports:[ModalSupplierDriverComponent]
})
export class ModalSupplierDriverModule { }
