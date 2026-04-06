import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalGradeWorkflowComponent } from './modal-grade-workflow.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { BarRatingModule } from 'ngx-bar-rating';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';



@NgModule({
  declarations: [ModalGradeWorkflowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    BarRatingModule,
    ModalAttachfileModule,
  ],
  exports:[ModalGradeWorkflowComponent]
})
export class ModalGradeWorkflowModule { }
