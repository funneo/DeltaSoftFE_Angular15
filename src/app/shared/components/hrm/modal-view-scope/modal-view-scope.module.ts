import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalViewScopeComponent } from './modal-view-scope.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { UtilityService } from '@app/shared/services';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxMaskModule } from 'ngx-mask';



@NgModule({
  declarations: [ModalViewScopeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    AngularDraggableModule,
    NgSelectModule,
    NgxMaskModule.forRoot(UtilityService.maskConfig),
    PipeSharedModule,
  ],exports: [ModalViewScopeComponent],
})
export class ModalViewScopeModule {}
