import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPortsComponent } from './modal-ports.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxMaskModule } from 'ngx-mask';



@NgModule({
  declarations: [ModalPortsComponent],
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
  ],exports:[ModalPortsComponent]
})
export class ModalPortsModule { }
