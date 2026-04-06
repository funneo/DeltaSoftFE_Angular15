import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalExternalOilPurchasedComponent } from './modal-external-oil-purchased.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalAttachfileModule } from '../../systems/modal-attachfile/modal-attachfile.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ModalExternalOilPurchasedComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    Daterangepicker,
    PipeSharedModule,
    ModalAttachfileModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
  ],exports:[ModalExternalOilPurchasedComponent]
})
export class ModalExternalOilPurchasedModule { }
