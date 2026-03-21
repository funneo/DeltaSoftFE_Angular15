import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCustomerLocationsComponent } from './modal-customer-locations.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalMapRoutesModule } from './../modal-map-routes/modal-map-routes.module';



@NgModule({
  declarations: [ModalCustomerLocationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalMapRoutesModule
  ],exports:[ModalCustomerLocationsComponent]
})
export class ModalCustomerLocationsModule { }
