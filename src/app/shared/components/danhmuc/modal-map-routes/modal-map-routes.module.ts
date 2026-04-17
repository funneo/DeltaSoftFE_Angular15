import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalMapRoutesComponent } from './modal-map-routes.component';
import { ModalVietmapRoutesComponent } from '../modal-vietmap-routes/modal-vietmap-routes.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [ModalMapRoutesComponent, ModalVietmapRoutesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot()
  ],
  exports: [ModalMapRoutesComponent, ModalVietmapRoutesComponent]
})
export class ModalMapRoutesModule { }
