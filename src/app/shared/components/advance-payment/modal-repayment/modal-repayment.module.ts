import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalRepaymentComponent } from './modal-repayment.component';
import { ModalPhieuThuModule } from '../../accounting/modal-phieu-thu/modal-phieu-thu.module';

@NgModule({
  declarations: [ModalRepaymentComponent],
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
    ModalPhieuThuModule
  ],
  exports:[ModalRepaymentComponent]
})
export class ModalRepaymentModule { }
