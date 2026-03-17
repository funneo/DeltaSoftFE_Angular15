import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Fee, GroupFee, PaymentFeeGroup, ResponseValue, RevenueFeeGroup } from '@app/shared/models';
import { NotificationService, FeeService, GroupFeeService, PaymentFeeGroupService, RevenueFeeGroupService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-fee',
  templateUrl: './modal-fee.component.html',
  styleUrls: ['./modal-fee.component.css']
})
export class ModalFeeComponent implements OnInit {
  public entity: Fee;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  public listGroupFee: GroupFee[];
  public listGroupPayment: PaymentFeeGroup[];
  public listGroupRevenue: RevenueFeeGroup[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  @ViewChild('aForm') aForm: ElementRef;
  constructor(private _notificationService: NotificationService, private feeService: FeeService,
    private groupFeeService: GroupFeeService,
    private paymentFeeGroupService: PaymentFeeGroupService,
    private revenueFeeGroupService: RevenueFeeGroupService) {

  }

  ngOnInit(): void {
    this.loadGroupFee();
    this.loadGroupPayment();
    this.loadGroupRevenue();
  }

  setFocus(name: string) {
    const ele = this.aForm.nativeElement[name];
    if (ele) {
      ele.focus();
    }
  }

  onShow() {
    console.log('Ok');

    this.setFocus("feename");
  }


  loadGroupFee() {
    this.groupFeeService.getAll().subscribe((res: ResponseValue<GroupFee[]>) => {
      this.listGroupFee = res.data;
    });
  }

  loadGroupPayment() {
    this.paymentFeeGroupService.getAll().subscribe((res: ResponseValue<PaymentFeeGroup[]>) => {
      this.listGroupPayment = res.data;
    });
  }

  loadGroupRevenue() {
    this.revenueFeeGroupService.getAll().subscribe((res: ResponseValue<RevenueFeeGroup[]>) => {
      this.listGroupRevenue = res.data;
    });
  }


  add() {
    this.entity = {
      status: false
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.feeService.getDetail(id).subscribe((res: ResponseValue<Fee>) => {
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
        this.feeService.add(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.feeService.update(this.entity).subscribe((res: number) => {
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

  onHidden() {
    this.CloseModal.emit();
  }
}
