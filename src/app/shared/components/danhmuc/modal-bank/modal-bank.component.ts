import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Bank, ResponseValue } from '@app/shared/models';
import { BankService, NotificationService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'modal-bank',
    templateUrl: './modal-bank.component.html',
    styleUrls: ['./modal-bank.component.css']
})
export class ModalBankComponent implements OnInit {
    public entity: Bank;
    public flagXem: boolean = false;
    public flagSave: boolean = false;
    @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
    @Output() CloseModal: EventEmitter<any> = new EventEmitter();
    @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

    constructor(
        private _notificationService: NotificationService,
        private bankService: BankService
    ) { }

    ngOnInit(): void { }

    add() {
        this.entity = { status: true };
        this.flagXem = false;
        this.flagSave = false;
        this.modalAddEdit.show();
    }

    edit(id: string, flag: boolean) {
        this.bankService.getDetail(id).subscribe((res: ResponseValue<Bank>) => {
            if (res.code == '200' || res.code == '201') {
                this.entity = res.data;
                this.flagXem = flag;
                this.flagSave = false;
                this.modalAddEdit.show();
            } else {
                this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
            }
        });
    }

    saveChange(form: NgForm) {
        if (form.valid) {
            this.flagSave = true;
            if (this.entity.bankId == undefined) {
                this.bankService.add(this.entity).subscribe((res: ResponseValue<any>) => {
                    if (res.code == '200' || res.code == '201') {
                        this.modalAddEdit.hide();
                        form.resetForm();
                        this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
                        this.SaveSuccess.emit(res.data);
                    } else {
                        this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
                        this.flagSave = false;
                    }
                }, () => { this.flagSave = false; });
            } else {
                this.bankService.update(this.entity).subscribe((res: ResponseValue<any>) => {
                    if (res.code == '200' || res.code == '201') {
                        this.modalAddEdit.hide();
                        form.resetForm();
                        this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
                        this.SaveSuccess.emit(res.data);
                    } else {
                        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
                        this.flagSave = false;
                    }
                }, () => { this.flagSave = false; });
            }
        }
    }

    OnHidden() {
        this.CloseModal.emit();
    }
}
