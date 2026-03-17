import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalAttachfileModule } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.module';
import { ModalJobCanonModule } from '@app/shared/components/canon/modal-job-canon/modal-job-canon.module';
import { DebitCanonRoutingModule } from './debit-canon-routing.module';
import { DebitCanonComponent } from './debit-canon.component';

@NgModule({
  declarations: [DebitCanonComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    DebitCanonRoutingModule,
    ModalJobCanonModule,
    Daterangepicker,
    ModalAttachfileModule
  ]
})
export class DebitCanonModule { }
