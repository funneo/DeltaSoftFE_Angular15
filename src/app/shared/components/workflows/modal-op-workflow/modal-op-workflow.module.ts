import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalOpWorkflowComponent } from './modal-op-workflow.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { BarRatingModule } from 'ngx-bar-rating';
// import {NgxPrintModule} from 'ngx-print';
import { ModalWorkflowAttackFilesModule } from '../modal-workflow-attack-files/modal-workflow-attack-files.module';
import { PrintDeliveryOpPageComponent } from '@app/print-pages/delivery-op-page/delivery-op-page.component';


@NgModule({
  declarations: [ModalOpWorkflowComponent,PrintDeliveryOpPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    BarRatingModule,
    // NgxPrintModule,
    ModalWorkflowAttackFilesModule,
  ],
  exports:[ModalOpWorkflowComponent],
})
export class ModalOpWorkflowModule { }
