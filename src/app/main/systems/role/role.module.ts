import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { RoleRoutingModule } from './role-routing.module';
import { RoleComponent } from './role.component';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { ModalRoleModule } from '@app/shared/components/systems/modal-role/modal-role.module';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';

@NgModule({
  declarations: [RoleComponent],
  imports: [
    CommonModule,
    RoleRoutingModule,
    PaginationModule.forRoot(),
    NgBusyModule,
    FormsModule,
    ModalRoleModule,
    SharedDirectivesModule
  ]
})
export class RoleModule { }
