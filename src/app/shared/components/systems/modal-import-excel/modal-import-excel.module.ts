import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalImportExcelComponent } from './modal-import-excel.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UtilityService } from '@app/shared/services';
import { NgxMaskModule } from 'ngx-mask';



@NgModule({
  declarations: [ModalImportExcelComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    PipeSharedModule,
    NgxSpinnerModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
  ],exports:[ModalImportExcelComponent]
})
export class ModalImportExcelModule { }
