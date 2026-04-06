import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDigitizationQuotationCustomerComponent } from './modal-digitization-quotation-customer.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxMaskModule } from 'ngx-mask';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { ModalViewSublistModule } from '../modal-view-sublist/modal-view-sublist.module';



@NgModule({
  declarations: [ModalDigitizationQuotationCustomerComponent],
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
    ModalAttachfileModule,
    ModalViewSublistModule
  ],
  exports: [ModalDigitizationQuotationCustomerComponent]
})
export class ModalDigitizationQuotationCustomerModule { }
