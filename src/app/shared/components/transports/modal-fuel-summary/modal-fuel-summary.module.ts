import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalFuelSummaryComponent } from './modal-fuel-summary.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';



@NgModule({
  declarations: [ModalFuelSummaryComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    AngularDraggableModule,
    NgSelectModule,
    Daterangepicker,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    PipeSharedModule,
    ModalAttachfileModule
  ],exports:[ModalFuelSummaryComponent]
})
export class ModalFuelSummaryModule { }
