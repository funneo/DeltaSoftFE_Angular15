import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PriceCanonComponent } from './price-canon.component';
import { PriceCanonRoutingModule } from './price-canon-routing.module';
import { ModalPriceCanonModule } from '@app/shared/components/canon/modal-price-canon/modal-price-canon.module';

@NgModule({
  declarations: [PriceCanonComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PriceCanonRoutingModule,
    Daterangepicker,
    ModalPriceCanonModule
  ]
})
export class PriceCanonModule { }
