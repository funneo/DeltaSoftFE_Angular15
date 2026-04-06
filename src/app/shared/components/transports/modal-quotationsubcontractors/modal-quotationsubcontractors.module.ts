import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalQuotationsubcontractorsComponent } from './modal-quotationsubcontractors.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { ModalQuotationsubdetailedModule } from '../modal-quotationsubdetailed/modal-quotationsubdetailed.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';



@NgModule({
  declarations: [ModalQuotationsubcontractorsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    Daterangepicker,
    AngularDraggableModule,
    NgSelectModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    TabsModule.forRoot(),
    PipeSharedModule,
    ModalQuotationsubdetailedModule
  ],
  exports:[ModalQuotationsubcontractorsComponent]
})
export class ModalQuotationsubcontractorsModule { }
