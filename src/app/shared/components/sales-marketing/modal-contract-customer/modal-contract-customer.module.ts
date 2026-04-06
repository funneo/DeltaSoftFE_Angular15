import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalContractCustomerComponent } from './modal-contract-customer.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { UtilityService } from '@app/shared/services';
import { NgxMaskModule } from 'ngx-mask';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';

@NgModule({
  declarations: [ModalContractCustomerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    Daterangepicker,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalAttachfileModule
   ],
   exports: [ModalContractCustomerComponent]
})
export class ModalContractCustomerModule { }
