import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSublistCategoryComponent } from './modal-sublist-category.component';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDraggableModule } from 'angular2-draggable';
import { NgBusyModule } from 'ng-busy';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';



@NgModule({
  declarations: [ModalSublistCategoryComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgBusyModule,
    AngularDraggableModule,
    NgSelectModule,
    TabsModule.forRoot(),
    PipeSharedModule,
  ],
  exports:[ModalSublistCategoryComponent]
})
export class ModalSublistCategoryModule { }
