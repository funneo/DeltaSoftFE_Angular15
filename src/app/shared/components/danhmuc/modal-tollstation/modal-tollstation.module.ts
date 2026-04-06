import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalTollstationComponent } from './modal-tollstation.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ModalTollstationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
  ],
  exports:[ModalTollstationComponent]
})
export class ModalTollstationModule { }
