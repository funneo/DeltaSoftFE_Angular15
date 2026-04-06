import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPaymentDetailedComponent } from './modal-payment-detailed.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxMaskModule } from 'ngx-mask';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [ModalPaymentDetailedComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
  ],exports:[ModalPaymentDetailedComponent]
})
export class ModalPaymentDetailedModule { }
