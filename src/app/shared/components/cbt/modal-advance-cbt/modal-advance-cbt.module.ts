import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAdvanceCbtComponent } from './modal-advance-cbt.component';
import { NgxMaskModule } from 'ngx-mask';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ModalAdvanceCbtComponent],
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
    NgxMaskModule.forRoot(UtilityService.maskConfig),

  ],exports:[ModalAdvanceCbtComponent]
})
export class ModalAdvanceCbtModule { }
