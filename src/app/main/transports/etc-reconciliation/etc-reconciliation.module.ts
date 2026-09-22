import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EtcReconciliationRoutingModule } from './etc-reconciliation-routing.module';
import { EtcReconciliationComponent } from './etc-reconciliation.component';

import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [EtcReconciliationComponent],
  imports: [
    CommonModule,
    EtcReconciliationRoutingModule,
    FormsModule,
    PipeSharedModule,
    NgxSpinnerModule
  ]
})
export class EtcReconciliationModule { }
