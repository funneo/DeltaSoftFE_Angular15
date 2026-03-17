import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Fee, OtherCategories, PaymentDetail, ResponseValue } from '@app/shared/models';
import { RateExchange } from '@app/shared/models/categories/rate-exchange.model';
import { UtilityService, OtherCategoriesService, AuthService, BranchService, EmployeeService, PaymentsService, CustomerService, FeeService, NotificationService } from '@app/shared/services';
import { RateExchangeService } from '@app/shared/services/categories/rate-exchange.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-payment-detailed',
  templateUrl: './modal-payment-detailed.component.html',
  styleUrls: ['./modal-payment-detailed.component.css']
})
export class ModalPaymentDetailedComponent implements OnInit {
  public item: PaymentDetail;
  flagSave = false;
  listFee: Fee[];
  listBranch: Branch[];
  listInvoice: any[] = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Có' },
    { id: 2, text: 'NỢ' },
  ];
  _listCurrency: OtherCategories[] = [];
  maskNumber = UtilityService.maskNumber;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  constructor(
    private _utilityService: UtilityService, private _otherCategoryService: OtherCategoriesService,
    private authService: AuthService, private branchService: BranchService,
    private paymentsService: PaymentsService, private rateExchangeService: RateExchangeService, private customerService: CustomerService,
    private feeService: FeeService, private _notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadFee();
    this.loadCurrency();
  }

  loadCurrency() {
    const params = new HttpParams()
      .set('type', 'CURRENCY');
    this._otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this._listCurrency = res.data;
    });
  }

  loadFee() {
    const params = new HttpParams()
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(_ => _.groupCode == 'CP01' || _.groupCode == 'CP02' || _.groupCode == 'CP03') || [];
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
  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  onChangeTien(data: PaymentDetail) {
    let s1 = +(data.amount ?? 0);
    let vat = +(data.vat ?? 0);
    data.amountAfterVAT = s1 + vat;

  }
  chagedFee(item: PaymentDetail, event: Fee) {
    if (event.groupCode == 'CP03') {
      item.hasInvoice = 0;
    }
    else {
      item.hasInvoice = 1;
    }

  }
  edit(item: PaymentDetail) {
    this.item = item;
    this.modalAddEdit.show();
  }
  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this.paymentsService.updateDetail(this.item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.modalAddEdit.hide();
          // form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(this.item);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
          this.flagSave = false;
        }
      }, () => {
        this.flagSave = false;
      });
    }
  }
  changeCurrency(item: PaymentDetail, event: OtherCategories) {
    if (event.categoryCode == 'VND') {
      item.exchangeRate = 0;
    }
    else {
      let itemInput: RateExchange = {
        currencyCode: event.categoryCode
      }
      this.rateExchangeService.getByCurrency(itemInput).subscribe((res: ResponseValue<RateExchange>) => {
        let itemVal = res.data;
        item.exchangeRate = itemVal.buy ? itemVal.buy : 0;
      });
    }
  }
  validateNumberInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  selectedNgaybatdau(item: PaymentDetail, event) {
    item.invoiceDate = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgaybatdau(item: PaymentDetail, event) {
    if (item.invoiceDate == null || item.invoiceDate?.length < 1)
      item.invoiceDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
