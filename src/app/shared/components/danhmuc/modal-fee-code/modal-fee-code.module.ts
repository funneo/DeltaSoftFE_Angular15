import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalFeeCodeComponent } from './modal-fee-code.component';
import { ModalFeeCodeLvl1Component } from './modal-fee-code-lvl1.component';
import { ModalFeeCodeLvl2Component } from './modal-fee-code-lvl2.component';

@NgModule({
  declarations: [ModalFeeCodeComponent, ModalFeeCodeLvl1Component, ModalFeeCodeLvl2Component],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    NgSelectModule
  ],
  exports: [ModalFeeCodeComponent, ModalFeeCodeLvl1Component, ModalFeeCodeLvl2Component]
})
export class ModalFeeCodeModule { }
