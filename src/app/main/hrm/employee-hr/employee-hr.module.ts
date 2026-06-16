import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalEmployeeHrModule } from '@app/shared/components/danhmuc/modal-employee-hr/modal-employee-hr.module';
import { EmployeeHrRoutingModule } from './employee-hr-routing.module';
import { EmployeeHrComponent } from './employee-hr.component';

@NgModule({
  declarations: [EmployeeHrComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgBusyModule,
    PaginationModule,
    PipeSharedModule,
    SharedDirectivesModule,
    EmployeeHrRoutingModule,
    ModalEmployeeHrModule
  ]
})
export class EmployeeHrModule { }
