import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalMapRoutesComponent } from './modal-map-routes.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [ModalMapRoutesComponent],
  imports: [
    CommonModule,
    ModalModule.forRoot()
  ],
  exports: [ModalMapRoutesComponent]
})
export class ModalMapRoutesModule { }
