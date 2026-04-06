import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalUserModule } from '@app/shared/components/systems/modal-user/modal-user.module';
import { ModalMatKhauModule } from '@app/shared/components/systems/modal-mat-khau/modal-mat-khau.module';

@NgModule({
  declarations: [UserComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    NgBusyModule,
    FormsModule,
    PaginationModule.forRoot(),
    SharedDirectivesModule,
    ModalUserModule,
    ModalMatKhauModule
  ]
})
export class UserModule { }
