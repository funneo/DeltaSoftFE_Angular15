import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DebtInventoryRoutingModule } from './debt-inventory-routing.module';
import { ModalInventoryModule } from '@app/shared/components/advance-payment/modal-inventory/modal-inventory.module';
import { DebtInventoryComponent } from './debt-inventory.component';


@NgModule({
  declarations: [DebtInventoryComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalInventoryModule,
    Daterangepicker,
    DebtInventoryRoutingModule
  ]
})
export class DebtInventoryModule { }
