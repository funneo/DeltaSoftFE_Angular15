import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgChartsModule } from 'ng2-charts';
import { ModalBranchModule } from '@app/shared/components/danhmuc/modal-branch/modal-branch.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NgSelectModule,
    NgChartsModule,
    PaginationModule.forRoot(),
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    ModalBranchModule,
  ]
})
export class HomeModule { }
