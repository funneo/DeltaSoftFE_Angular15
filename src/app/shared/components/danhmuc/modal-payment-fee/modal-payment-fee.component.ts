import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { PaymentFeeGroup, ResponseValue } from '@app/shared/models';
import { NotificationService, PaymentFeeGroupService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-payment-fee',
  templateUrl: './modal-payment-fee.component.html',
  styleUrls: ['./modal-payment-fee.component.css']
})
export class ModalPaymentFeeComponent implements OnInit {
  public entity: PaymentFeeGroup;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private paymentFeeGroupService: PaymentFeeGroupService) { }

  ngOnInit(): void {
  }

  add() {
    this.entity = {
      status: true
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.paymentFeeGroupService.getDetail(id).subscribe((res: ResponseValue<PaymentFeeGroup>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this.paymentFeeGroupService.add(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.paymentFeeGroupService.update(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
