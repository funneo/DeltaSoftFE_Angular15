import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImportGasRoutingModule } from './import-gas-routing.module';
import { ImportGasComponent } from './import-gas.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalImportGasModule } from '@app/shared/components/transports/modal-import-gas/modal-import-gas.module';
import { ModalImportGasComponent } from '@app/shared/components/transports/modal-import-gas/modal-import-gas.component';
import { Daterangepicker } from 'ng2-daterangepicker';


@NgModule({
  declarations: [ImportGasComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    ImportGasRoutingModule,
    ModalImportGasModule
  ]
})
export class ImportGasModule { }
