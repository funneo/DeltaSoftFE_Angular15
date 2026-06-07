import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgBusyModule } from 'ng-busy';
import { NgxMaskModule } from 'ngx-mask';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services/utility.service';
import { ModalVehicleFuelClosingComponent } from './modal-vehicle-fuel-closing.component';

@NgModule({
  declarations: [ModalVehicleFuelClosingComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    Daterangepicker,
    PipeSharedModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig)
  ],
  exports: [ModalVehicleFuelClosingComponent]
})
export class ModalVehicleFuelClosingModule {}
