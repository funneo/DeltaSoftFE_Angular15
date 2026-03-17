import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionCsComponent } from './permission-cs.component';
import { PermissionCsRoutingModule } from './permission-cs-routing.module';
import { ModalPermissionCsModule } from '@app/shared/components/systems/modal-permission-cs/modal-permission-cs.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [PermissionCsComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    PermissionCsRoutingModule,
    ModalPermissionCsModule
  ]
})
export class PermissionCsModule { }
