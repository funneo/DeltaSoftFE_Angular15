import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdvanceTransferRoutingModule } from './advance-transfer-routing.module';
import { AdvanceTransferComponent } from './advance-transfer.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgBusyModule } from 'ng-busy';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ModalPhieuThuModule } from '@app/shared/components/accounting/modal-phieu-thu/modal-phieu-thu.module';
import { ModalAdvanceModule } from '@app/shared/components/advance-payment/modal-advance/modal-advance.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { DatePipe } from '@angular/common';
import { ModalAdvanceTransferModule } from '@app/shared/components/advance-payment/modal-advance-transfer/modal-advance-transfer.module';

@NgModule({
    declarations: [AdvanceTransferComponent],
    imports: [
        CommonModule,
        AdvanceTransferRoutingModule,
        PaginationModule,
        FormsModule,
        NgSelectModule,
        Daterangepicker,
        NgBusyModule,
        ModalPhieuChiModule,
        ModalPhieuThuModule,
        ModalAdvanceTransferModule,
        PipeSharedModule,
        SharedDirectivesModule
    ],
    providers: [
        DatePipe
    ]
})
export class AdvanceTransferModule { }
