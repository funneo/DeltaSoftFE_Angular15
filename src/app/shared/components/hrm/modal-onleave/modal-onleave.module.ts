import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalOnleaveComponent } from './modal-onleave.component';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [ModalOnleaveComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    TabsModule.forRoot(),
    NgSelectModule,
    Daterangepicker,
    PipeSharedModule,
  ],exports:[ModalOnleaveComponent]
})
export class ModalOnleaveModule { }
