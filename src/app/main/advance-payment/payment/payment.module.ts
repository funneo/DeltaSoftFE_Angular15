import { ModalListPaymentAcceptModule } from './../../../shared/components/advance-payment/modal-list-payment-accept/modal-list-payment-accept.module';
import { ModalListAdvanceModule } from './../../../shared/components/advance-payment/modal-list-advance/modal-list-advance.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PaymentRoutingModule } from './payment-routing.module';
import { PaymentComponent } from './payment.component';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalShipmentModule } from '@app/shared/components/shipments/modal-shipment/modal-shipment.module';
import { ModalListApprovedLogModule } from '@app/shared/components/advance-payment/modal-list-approved-log/modal-list-approved-log.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalPaymentDetailedModule } from '@app/shared/components/advance-payment/modal-payment-detailed/modal-payment-detailed.module';
import { ModalImportExcelModule } from '@app/shared/components/systems/modal-import-excel/modal-import-excel.module';
import { ModalDocHoaDonModule } from '@app/shared/components/advance-payment/modal-doc-hoa-don/modal-doc-hoa-don.module';
import { ModalPendingInvoicePickerModule } from '@app/shared/components/advance-payment/modal-pending-invoice-picker/modal-pending-invoice-picker.module';
import { ModalPaymentDetailModule } from '@app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.module';

@NgModule({
  declarations: [PaymentComponent, PaymentDetailComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PaymentRoutingModule,
    Daterangepicker,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalAttachfileModule,
    ModalShipmentModule,
    ModalListApprovedLogModule,ModalPaymentDetailedModule,
    ModalListAdvanceModule,NgxSpinnerModule,ModalListPaymentAcceptModule,
    ModalImportExcelModule,ModalDocHoaDonModule,
    ModalPendingInvoicePickerModule,
    ModalPaymentDetailModule
  ],
  providers:[
    DatePipe,
  ]
})
export class PaymentModule { }
