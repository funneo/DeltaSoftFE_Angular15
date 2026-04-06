import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalDriverFuelApprovalComponent } from './modal-driver-fuel-approval.component';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services/utility.service';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';



@NgModule({
  declarations: [ModalDriverFuelApprovalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    Daterangepicker,
    PipeSharedModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    ModalAttachfileModule
  ],
  exports:[ModalDriverFuelApprovalComponent]
})
export class ModalDriverFuelApprovalModule { }
