import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ShippingTaskCsRoutingModule } from './shipping-task-cs-routing.module';
import { ShippingTaskCsComponent } from './shipping-task-cs.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalShippingTaskCsModule } from '@app/shared/components/transports/modal-shipping-task-cs/modal-shipping-task-cs.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [ShippingTaskCsComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    ModalShippingTaskCsModule,
    Daterangepicker,
    TabsModule.forRoot(),
    ShippingTaskCsRoutingModule,
    ModalAttachfileModule,
    NgxSpinnerModule,
  ],providers: [
    DatePipe
  ],
})
export class ShippingTaskCsModule { }
