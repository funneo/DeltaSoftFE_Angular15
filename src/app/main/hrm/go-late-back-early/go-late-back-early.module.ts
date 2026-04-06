import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { GoLateBackEarlyRoutingModule } from "./go-late-back-early-routing.module";
import { GoLateBackEarlyComponent } from "./go-late-back-early.component";
import { FormsModule } from "@angular/forms";
import { SharedDirectivesModule } from "@app/shared/directives/shared-directives.module";
import { PipeSharedModule } from "@app/shared/pipes/pipe-shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgBusyModule } from "ng-busy";
import { Daterangepicker } from "ng2-daterangepicker";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { ModalGoLateBackEarlyModule } from "@app/shared/components/hrm/modal-go-late-back-early/modal-go-late-back-early.module";

@NgModule({
  declarations: [GoLateBackEarlyComponent],
  imports: [
    CommonModule,
    PaginationModule,
    NgBusyModule,
    FormsModule,
    SharedDirectivesModule,
    Daterangepicker,
    PipeSharedModule,
    NgSelectModule,
    GoLateBackEarlyRoutingModule,
    ModalGoLateBackEarlyModule
  ],
})
export class GoLateBackEarlyModule {}
