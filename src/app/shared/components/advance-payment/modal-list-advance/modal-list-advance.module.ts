import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalListAdvanceComponent } from './modal-list-advance.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';



@NgModule({
  declarations: [ModalListAdvanceComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    AngularDraggableModule,
    FormsModule,
    ModalModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    Daterangepicker
  ],exports:[ModalListAdvanceComponent]
})
export class ModalListAdvanceModule { }
