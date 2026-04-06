import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { BanksComponent } from './banks.component';
import { ModalBankModule } from '@app/shared/components/danhmuc/modal-bank/modal-bank.module';
import { BanksRoutingModule } from './banks-routing.module';

@NgModule({
    declarations: [BanksComponent],
    imports: [
        CommonModule,
        PaginationModule,
        NgBusyModule,
        FormsModule,
        SharedDirectivesModule,
        PipeSharedModule,
        BanksRoutingModule,
        ModalBankModule
    ]
})
export class BanksModule { }
