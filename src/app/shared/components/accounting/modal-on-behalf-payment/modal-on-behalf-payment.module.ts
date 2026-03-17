import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalOnBehalfPaymentComponent } from './modal-on-behalf-payment.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { PipeSharedModule } from '../../../pipes/pipe-shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';

@NgModule({
  declarations: [ModalOnBehalfPaymentComponent],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    PipeSharedModule,
    TabsModule.forRoot()
  ],
  exports: [ModalOnBehalfPaymentComponent]
})
export class ModalOnBehalfPaymentModule { }
