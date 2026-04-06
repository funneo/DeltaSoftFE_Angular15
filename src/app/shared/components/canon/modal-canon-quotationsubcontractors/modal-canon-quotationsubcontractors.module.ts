import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCanonQuotationsubcontractorsComponent } from './modal-canon-quotationsubcontractors.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgBusyModule } from 'ng-busy';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgxMaskModule } from 'ngx-mask';
import { UtilityService } from '@app/shared/services';

@NgModule({
  declarations: [ModalCanonQuotationsubcontractorsComponent],
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
    PipeSharedModule
  ],
  exports:[ModalCanonQuotationsubcontractorsComponent]
})
export class ModalCanonQuotationsubcontractorsModule { }
