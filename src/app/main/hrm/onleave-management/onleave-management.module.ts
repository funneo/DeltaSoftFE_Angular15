import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnleaveManagementRoutingModule } from './onleave-management-routing.module';
import { OnleaveManagementComponent } from './onleave-management.component';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [OnleaveManagementComponent],
  imports: [
    CommonModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    OnleaveManagementRoutingModule
  ]
})
export class OnleaveManagementModule { }
