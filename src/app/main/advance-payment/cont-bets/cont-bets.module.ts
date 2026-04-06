import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalPhieuChiModule } from '@app/shared/components/accounting/modal-phieu-chi/modal-phieu-chi.module';
import { ContBetsComponent } from './cont-bets.component';
import { ContBetsRoutingModule } from './cont-bets-routing.module';
import { ModalContBetsModule } from '@app/shared/components/advance-payment/modal-cont-bets/modal-cont-bets.module';

@NgModule({
  declarations: [ContBetsComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ContBetsRoutingModule,
    ModalPhieuChiModule,
    Daterangepicker,
    ModalContBetsModule
  ],
  providers:[
    DatePipe,
  ]
})
export class ContBetsModule { }
