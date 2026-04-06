import { ModalCustomerLocationsModule } from './../modal-customer-locations/modal-customer-locations.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalCustomerComponent } from './modal-customer.component';
import { ModalCustomerRoutesModule } from '../modal-customer-routes/modal-customer-routes.module';
import { ModalCustomerNormalRoutesComponent } from '../modal-customer-normal-routes/customer-normal-routes.component';
import { ModalCustomerNormalRoutesModule } from '../modal-customer-normal-routes/customer-normal-routes.module';
import { ModalCustomerTollRoutesModule } from '../modal-customer-toll-routes/modal-customer-toll-routes.module';

@NgModule({
  declarations: [ModalCustomerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    ModalCustomerLocationsModule,
    ModalCustomerRoutesModule,
    ModalCustomerNormalRoutesModule
   ],
   exports: [ModalCustomerComponent]
})
export class ModalCustomerModule { }
