import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { CanonPrice, CanonRoad, Customer, Fee, ResponseValue } from '@app/shared/models';
import { NotificationService, CanonPriceService, CustomerService, CanonRoadService, UtilityService, FeeService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'modal-price-canon',
  templateUrl: './modal-price-canon.component.html',
  styleUrls: ['./modal-price-canon.component.css']
})
export class ModalPriceCanonComponent implements OnInit {

  public entity: CanonPrice;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listCustomers: Customer[];
  listRoad: CanonRoad[];
  listFee: Fee[]
  maskNumber = UtilityService.maskNumber;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  @ViewChild('aForm') aForm: ElementRef;
  @ViewChild('addEditForm') f: NgForm;
  @HostListener('keyup', ['$event'])
  keyevent(event) {
    if (event.keyCode === 38) {
      this.setPrevFocus(event.target.name);
    }
    if (event.keyCode === 40) {
      //this.setValue(event);
      this.setNextFocus(event.target.name);
    }
  }
  constructor(private _notificationService: NotificationService, private canonPriceService: CanonPriceService,
    private interactivityChecker: InteractivityChecker, private customerService: CustomerService, private canonRoadService: CanonRoadService,
    private feeService: FeeService) { }

  ngOnInit(): void {
    this.loadCustomer();
    this.loadFee();
  }

  loadCustomer() {
    const params = new HttpParams()
      .set('keyword', '')
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomers = res.data;
    });
  }

  _customerId: number;
  changedCustomer(event: Customer) {
    this._customerId = event?.id;
    this.loadRoad();
  }

  loadRoad(): void {
    const params = new HttpParams()
      .set('customerId', this._customerId?.toString());
    this.canonRoadService.getAll(params).subscribe((res: ResponseValue<CanonRoad[]>) => {
      this.listRoad = res.data;
    });
  }

  loadFee() {
    const params = new HttpParams()
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(_ => _.groupCode == 'DT01') || [];
      // Create completely new objects to prevent cache mutation
      this.listFee = filtered.map(fee => {
        const newFee: Fee = {
          id: fee.id,
          feeCode: fee.feeCode,
          feeName: fee.feeCode + '-' + fee.feeName,
          feeNameEnglish: fee.feeNameEnglish,
          groupFeeId: fee.groupFeeId,
          paymentFeeGroupId: fee.paymentFeeGroupId,
          revenueFeeGroupId: fee.revenueFeeGroupId,
          debitAccount: fee.debitAccount,
          creditAccount: fee.creditAccount,
          notes: fee.notes,
          status: fee.status,
          checked: fee.checked,
          groupName: fee.groupName,
          groupCode: fee.groupCode,
          paymentGroupName: fee.paymentGroupName,
          revenueGroupName: fee.revenueGroupName,
          isDef: fee.isDef
        };
        return newFee;
      });
    });
  }

  setFocus(name) {
    const ele = this.aForm.nativeElement[name];
    if (ele) {
      ele.focus();
    }
  }

  onShow() {
    this.setFocus("groupfeename");
  }

  setPrevFocus(currentId) {
    const ctrls = Object.keys(this.f.controls);
    for (let key = ctrls.indexOf(currentId) - 1; key >= 0; key--) {
      const control = this.aForm.nativeElement[ctrls[key]];
      if (control && this.interactivityChecker.isFocusable(control)) {
        control.focus();
        control.select();
        break;
      }
    }
  }

  setNextFocus(currentId) {
    const ctrls = Object.keys(this.f.controls);
    for (let key = ctrls.indexOf(currentId) + 1; key < ctrls.length; key++) {
      const control = this.aForm.nativeElement[ctrls[key]];
      if (control && this.interactivityChecker.isFocusable(control)) {
        control.focus();
        control.select();
        break;
      }
    }
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
    this.canonPriceService.getDetail(id).subscribe((res: ResponseValue<CanonPrice>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this._customerId = this.entity.customerId;
        this.loadRoad();
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
        this.canonPriceService.add(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.canonPriceService.update(this.entity).subscribe((res: number) => {
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
