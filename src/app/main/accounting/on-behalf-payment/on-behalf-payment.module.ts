import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OnBehalfPaymentComponent } from './on-behalf-payment.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalOnBehalfPaymentModule } from '../../../shared/components/accounting/modal-on-behalf-payment/modal-on-behalf-payment.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Daterangepicker } from 'ng2-daterangepicker';

const routes: Routes = [
  { path: '', component: OnBehalfPaymentComponent }
];

@NgModule({
  declarations: [OnBehalfPaymentComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ModalOnBehalfPaymentModule,
    PaginationModule.forRoot(),
    NgSelectModule,
    NgxSpinnerModule,
    Daterangepicker
  ],
  providers: [DatePipe]
})
export class OnBehalfPaymentModule { }
