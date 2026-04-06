import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalShipmentViewSearchComponent } from './modal-shipment-view-search.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [ModalShipmentViewSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    RouterModule
  ], exports:[ModalShipmentViewSearchComponent]
})
export class ModalShipmentViewSearchModule { }
