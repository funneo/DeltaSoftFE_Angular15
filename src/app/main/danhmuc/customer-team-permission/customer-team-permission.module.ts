import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerTeamPermissionRoutingModule } from './customer-team-permission-routing.module';
import { CustomerTeamPermissionComponent } from './customer-team-permission.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBusyModule } from 'ng-busy';
import { PaginationModule } from 'ngx-bootstrap/pagination';


@NgModule({
  declarations: [CustomerTeamPermissionComponent],
  imports: [
    CommonModule,
    CustomerTeamPermissionRoutingModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
  ]
})
export class CustomerTeamPermissionModule { }
