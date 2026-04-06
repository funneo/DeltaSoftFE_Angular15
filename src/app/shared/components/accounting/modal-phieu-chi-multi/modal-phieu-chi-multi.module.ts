import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPhieuChiMultiComponent } from './modal-phieu-chi-multi.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ModalPhieuChiMultiComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    Daterangepicker,
    ModalAttachfileModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig)
  ],
  exports:[ModalPhieuChiMultiComponent]
})
export class ModalPhieuChiMultiModule { }
