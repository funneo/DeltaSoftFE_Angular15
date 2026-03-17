import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { PipeSharedModule } from '@app/shared/pipes/pipe-shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { Daterangepicker } from 'ng2-daterangepicker';
import { RoadCanonComponent } from './road-canon.component';
import { RoadCanonRoutingModule } from './road-canon-routing.module';
import { ModalRoadCanonModule } from '@app/shared/components/canon/modal-road-canon/modal-road-canon.module';

@NgModule({
  declarations: [RoadCanonComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    PipeSharedModule,
    NgSelectModule,
    RoadCanonRoutingModule,
    Daterangepicker,
    ModalRoadCanonModule
  ]
})
export class RoadCanonModule { }
