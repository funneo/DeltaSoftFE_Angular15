import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { OfficeAttendanceRoutingModule } from './office-attendance-routing.module';
import { OfficeAttendanceComponent } from './office-attendance.component';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalOfficeAttendanceImportModule } from '@app/shared/components/hrm/modal-office-attendance-import/modal-office-attendance-import.module';
import { ModalOfficeAttendanceDetailModule } from '@app/shared/components/hrm/modal-office-attendance-detail/modal-office-attendance-detail.module';
import { ModalOfficeAttendanceConfigModule } from '@app/shared/components/hrm/modal-office-attendance-config/modal-office-attendance-config.module';

@NgModule({
  declarations: [OfficeAttendanceComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgBusyModule,
    PipeSharedModule,
    SharedDirectivesModule,
    OfficeAttendanceRoutingModule,
    ModalOfficeAttendanceImportModule,
    ModalOfficeAttendanceDetailModule,
    ModalOfficeAttendanceConfigModule
  ]
})
export class OfficeAttendanceModule { }
