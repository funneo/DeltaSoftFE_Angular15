import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularDraggableModule } from 'angular2-draggable';
import { SharedDirectivesModule } from '@app/shared/directives/shared-directives.module';
import { ModalBankComponent } from './modal-bank.component';

@NgModule({
    declarations: [ModalBankComponent],
    imports: [
        CommonModule,
        FormsModule,
        ModalModule.forRoot(),
        AngularDraggableModule,
        SharedDirectivesModule
    ],
    exports: [ModalBankComponent]
})
export class ModalBankModule { }
