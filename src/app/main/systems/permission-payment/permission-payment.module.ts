import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PermissionPaymentComponent } from './permission-payment.component';
import { PermissionPaymentRoutingModule } from './permission-payment-routing.module';
import { ModalPermissionPaymentModule } from '@app/shared/components/systems/modal-permission-payment/modal-permission-payment.module';

@NgModule({
  declarations: [PermissionPaymentComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PermissionPaymentRoutingModule,
    ModalPermissionPaymentModule
  ]
})
export class PermissionPaymentModule { }
