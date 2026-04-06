import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PermissionAdvanceComponent } from './permission-advance.component';
import { ModalPermissionAdvanceModule } from '@app/shared/components/systems/modal-permission-advance/modal-permission-advance.module';
import { PermissionAdvanceRoutingModule } from './permission-advance-routing.module';

@NgModule({
  declarations: [PermissionAdvanceComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PermissionAdvanceRoutingModule,
    ModalPermissionAdvanceModule
  ]
})
export class PermissionAdvanceModule { }
