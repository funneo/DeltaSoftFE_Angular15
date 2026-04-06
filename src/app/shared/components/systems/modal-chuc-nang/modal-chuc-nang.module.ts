// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ModalChucNangComponent } from './modal-chuc-nang.component';



// @NgModule({
//   declarations: [ModalChucNangComponent],
//   imports: [
//     CommonModule
//   ]
// })
// export class ModalChucNangModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalChucNangComponent } from './modal-chuc-nang.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgxMaskModule } from 'ngx-mask';
import { Daterangepicker } from 'ng2-daterangepicker';

@NgModule({
  declarations: [ModalChucNangComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    Daterangepicker,
  ],
  exports: [ModalChucNangComponent]
})
export class ModalChucNangModule { }
