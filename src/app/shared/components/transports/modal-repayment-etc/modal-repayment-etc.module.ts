import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRepaymentEtcComponent } from './modal-repayment-etc.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalDispatchorderModule } from '../modal-dispatchorder/modal-dispatchorder.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalListDispatchorderEtcModule } from '../modal-list-dispatchorder-etc/modal-list-dispatchorder-etc.module';



@NgModule({
  declarations: [ModalRepaymentEtcComponent],
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
    ModalListDispatchorderEtcModule,
    ModalDispatchorderModule

  ],exports:[ModalRepaymentEtcComponent]
})
export class ModalRepaymentEtcModule { }
