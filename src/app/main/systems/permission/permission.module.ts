import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionRoutingModule } from './permission-routing.module';
import { PermissionComponent } from './permission.component';
import { NgBusyModule } from 'ng-busy';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [PermissionComponent],
  imports: [
    CommonModule,
    PermissionRoutingModule,
    NgBusyModule,
    FormsModule,
    NgSelectModule
  ]
})
export class PermissionModule { }
