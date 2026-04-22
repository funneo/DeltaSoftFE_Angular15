import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalMapRoutesComponent } from './modal-map-routes.component';
import { ModalVietmapRoutesComponent } from '../modal-vietmap-routes/modal-vietmap-routes.component';
import { ModalRouteCompareComponent } from '../modal-route-compare/modal-route-compare.component';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [ModalMapRoutesComponent, ModalVietmapRoutesComponent, ModalRouteCompareComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ModalModule.forRoot()
  ],
  exports: [ModalMapRoutesComponent, ModalVietmapRoutesComponent, ModalRouteCompareComponent]
})
export class ModalMapRoutesModule { }
